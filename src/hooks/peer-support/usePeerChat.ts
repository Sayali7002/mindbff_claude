import { useState, useCallback, useRef, useEffect } from 'react';
import { PeerMatch, ChatMessage } from '@/types/peer-support';
import { supabase } from '@/lib/supabase';

type SubscriptionStatus = 'CONNECTING' | 'SUBSCRIBED' | 'CHANNEL_ERROR' | 'CLOSED' | 'RETRYING';

interface UsePeerChatReturn {
  selectedPeer: PeerMatch | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  isAnonymous: boolean;
  subscriptionStatus: SubscriptionStatus;
  setIsAnonymous: (anonymous: boolean) => void;
  fetchMessages: (peerId: string) => Promise<ChatMessage[]>;
  sendMessage: (receiverId: string, message: string) => Promise<ChatMessage | null>;
  deleteChat: (peerId: string) => Promise<boolean>;
  initializeChat: (peer: PeerMatch, initialMessages?: ChatMessage[]) => Promise<void>;
  setSelectedPeer: (peer: PeerMatch | null) => void;
  refreshSubscription: () => void;
  cleanup: () => void;
  testRealtime: () => Promise<void>;
}

export function usePeerChat(): UsePeerChatReturn {
  const [selectedPeer, setSelectedPeer] = useState<PeerMatch | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>('CLOSED');

  // Refs for managing subscriptions and preventing race conditions
  const subscriptionRef = useRef<any>(null);
  const currentPeerRef = useRef<string | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // Cleanup function for subscriptions
  const cleanupSubscription = useCallback(() => {
    if (subscriptionRef.current) {
      console.log('Cleaning up subscription');
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    setSubscriptionStatus('CLOSED');
    retryCountRef.current = 0;
  }, []);

  // Setup real-time subscription for a peer
  const setupSubscription = useCallback(async (peerId: string, userId: string) => {
    if (subscriptionRef.current) {
      cleanupSubscription();
    }

    console.log(`Setting up subscription for peer: ${peerId}, user: ${userId}`);
    setSubscriptionStatus('CONNECTING');

    try {
      // Create unique channel name for this conversation (order userId and peerId lexicographically)
      const [idA, idB] = userId < peerId ? [userId, peerId] : [peerId, userId];
      const channelName = `peer_chat_${idA}_${idB}`; 
     {/*  const channelName = `peer_chat_${userId}_${peerId}`;*/}
      console.log(`Creating channel: ${channelName}`);

      // Create subscription that listens for messages in both directions
      const subscription = supabase
        .channel(channelName)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'peer_support_chats'
        }, async (payload) => {
          console.log('Real-time INSERT received:', payload);
          
          // Check if this message is relevant to our conversation
          const message = payload.new;
          if (message && 
              ((message.sender_id === userId && message.receiver_id === peerId) ||
               (message.sender_id === peerId && message.receiver_id === userId))) {
            console.log('Relevant message detected, fetching updated messages');
            try {
              await fetchMessages(peerId);
            } catch (err) {
              console.error('Error fetching messages after real-time update:', err);
            }
          }
        })
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'peer_support_chats'
        }, async (payload) => {
          console.log('Real-time UPDATE received:', payload);
          const message = payload.new;
          if (message && 
              ((message.sender_id === userId && message.receiver_id === peerId) ||
               (message.sender_id === peerId && message.receiver_id === userId))) {
            try {
              await fetchMessages(peerId);
            } catch (err) {
              console.error('Error fetching messages after real-time update:', err);
            }
          }
        })
        .on('postgres_changes', { 
          event: 'DELETE', 
          schema: 'public', 
          table: 'peer_support_chats'
        }, async (payload) => {
          console.log('Real-time DELETE received:', payload);
          const message = payload.old;
          if (message && 
              ((message.sender_id === userId && message.receiver_id === peerId) ||
               (message.sender_id === peerId && message.receiver_id === userId))) {
            try {
              await fetchMessages(peerId);
            } catch (err) {
              console.error('Error fetching messages after real-time update:', err);
            }
          }
        })
        .subscribe((status) => {
          console.log('Subscription status:', status);
          setSubscriptionStatus(status as SubscriptionStatus);
          
          if (status === 'CHANNEL_ERROR') {
            console.error('Subscription error, attempting retry...');
            if (retryCountRef.current < maxRetries) {
              retryCountRef.current++;
              setSubscriptionStatus('RETRYING');
              retryTimeoutRef.current = setTimeout(() => {
                setupSubscription(peerId, userId);
              }, 2000 * retryCountRef.current); // Exponential backoff
            } else {
              console.error('Max retries reached for subscription');
              setSubscriptionStatus('CHANNEL_ERROR');
            }
          }
        });

      subscriptionRef.current = subscription;
      currentPeerRef.current = peerId;
      
    } catch (err) {
      console.error('Error setting up subscription:', err);
      setSubscriptionStatus('CHANNEL_ERROR');
    }
  }, [cleanupSubscription]);

  // Fetch messages for a peer
  const fetchMessages = useCallback(async (peerId: string): Promise<ChatMessage[]> => {
    try {
      console.log(`Fetching messages for peer: ${peerId}`);
      setIsLoading(true);
      setError(null);
      
      const {
        data: { session: chatSession },
        error: sessionError
      } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        throw new Error('Authentication error: ' + sessionError.message);
      }
      
      if (!chatSession || !chatSession.access_token) {
        console.error('No auth session or token available');
        throw new Error('You need to be logged in to view messages');
      }

      console.log('Making API call to fetch messages...');
      const response = await fetch(`/api/peer-support/chats?peer_id=${peerId}`, {
        headers: { 
          'Authorization': `Bearer ${chatSession.access_token}` 
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Server error response:', response.status, errorData);
        throw new Error(`Failed to fetch messages: ${errorData.error || response.statusText}`);
      }
      
      const data = await response.json();
      console.log('API response data:', data);
      
      // Transform timestamps to Date objects
      const formattedMessages = (data.messages || []).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
      
      console.log(`Setting ${formattedMessages.length} messages in state`);
      setMessages(formattedMessages);
      
      // Update selected peer if provided
      if (data.peer) {
        setSelectedPeer(prevPeer => {
          if (!prevPeer || prevPeer.id !== data.peer.id) {
            return {
              id: data.peer.id,
              name: data.peer.name,
              avatar: data.peer.avatar,
              matchScore: 0,
              supportPreferences: data.peer.experienceAreas || [],
              supportType: data.peer.supportType,
              location: data.peer.location || '',
              isActive: data.peer.isActive || false,
              rating: 0,
              totalRatings: 0,
              certifiedMentor: false
            };
          }
          return prevPeer;
        });
      }
      
      return formattedMessages;
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Send a message
  const sendMessage = useCallback(async (receiverId: string, message: string): Promise<ChatMessage | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const {
        data: { session: sendSession },
        error: sessionError
      } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        throw new Error('Authentication error: ' + sessionError.message);
      }
      
      if (!sendSession || !sendSession.access_token) {
        console.error('No auth session or token available');
        throw new Error('You need to be logged in to send messages');
      }
      
      console.log('Sending message with auth token:', sendSession.access_token.substring(0, 10) + '...');

      const response = await fetch('/api/peer-support/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sendSession.access_token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          receiver_id: receiverId,
          message,
          is_anonymous: isAnonymous
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Server error response:', response.status, errorData);
        throw new Error(`Failed to send message: ${errorData.error || response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Message sent successfully:', data);
      
      // Add the new message to the list with Date object
      const newMessage = {
        ...data.chat,
        timestamp: new Date(data.chat.timestamp)
      };
      
      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAnonymous]);

  // Delete all chat messages with a peer
  const deleteChat = useCallback(async (peerId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`Attempting to delete chat with peer: ${peerId}`);
      
      const {
        data: { session: deleteSession },
        error: sessionError
      } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        throw new Error('Authentication error: ' + sessionError.message);
      }
      
      if (!deleteSession || !deleteSession.access_token) {
        console.error('No auth session or token available');
        throw new Error('You need to be logged in to delete messages');
      }
      
      console.log('Got auth session, sending delete request to API');

      const response = await fetch(`/api/peer-support/chats?peer_id=${peerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${deleteSession.access_token}`
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Server error response:', response.status, errorData);
        throw new Error(`Failed to delete chat: ${errorData.error || response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Delete response:', result);
      
      // Clear messages if the deleted chat was for the currently selected peer
      if (selectedPeer && selectedPeer.id === peerId) {
        console.log('Clearing messages for current peer');
        setMessages([]);
        setSelectedPeer(null);
      }
      
      return true;
    } catch (err) {
      console.error('Error deleting chat:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeer]);

  // Initialize chat with a peer
  const initializeChat = useCallback(async (peer: PeerMatch, initialMessages: ChatMessage[] = []) => {
    try {
      console.log('Initializing chat for peer:', peer.id);
      
      // Clean up any existing subscription
      cleanupSubscription();
      
      setSelectedPeer(peer);
      setMessages(initialMessages);
      
      // Get current user ID for subscription
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error('No authenticated user found');
      }
      
      // Set up real-time subscription
      await setupSubscription(peer.id, session.user.id);
      
      // Fetch initial messages
      await fetchMessages(peer.id);
      
    } catch (err) {
      console.error('Error initializing chat:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize chat');
    }
  }, [cleanupSubscription, setupSubscription, fetchMessages]);

  // Refresh subscription manually
  const refreshSubscription = useCallback(async () => {
    if (selectedPeer) {
      console.log('Manually refreshing subscription');
      cleanupSubscription();
      retryCountRef.current = 0;
      
      // Get current user ID
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        await setupSubscription(selectedPeer.id, session.user.id);
      }
    }
  }, [selectedPeer, cleanupSubscription, setupSubscription]);

  // Cleanup function for component unmount
  const cleanup = useCallback(() => {
    console.log('Cleaning up usePeerChat hook');
    cleanupSubscription();
    setSelectedPeer(null);
    setMessages([]);
    setError(null);
    setIsLoading(false);
    setSubscriptionStatus('CLOSED');
  }, [cleanupSubscription]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Test function to verify real-time subscription
  const testRealtime = useCallback(async () => {
    if (!selectedPeer) return;
    
    console.log('Testing real-time subscription...');
    console.log('Current subscription status:', subscriptionStatus);
    console.log('Current peer:', selectedPeer.id);
    console.log('Current messages count:', messages.length);
    
    // Try to send a test message
    const testMessage = `Test message at ${new Date().toISOString()}`;
    console.log('Sending test message:', testMessage);
    
    const result = await sendMessage(selectedPeer.id, testMessage);
    console.log('Test message result:', result);
  }, [selectedPeer, subscriptionStatus, messages.length, sendMessage]);

  return {
    selectedPeer,
    messages,
    isLoading,
    error,
    isAnonymous,
    subscriptionStatus,
    setIsAnonymous,
    fetchMessages,
    sendMessage,
    deleteChat,
    initializeChat,
    setSelectedPeer,
    refreshSubscription,
    cleanup,
    testRealtime
  };
}
