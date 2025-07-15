import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { PeerMatch, ChatMessage } from '@/types/peer-support';

interface PeerChatProps {
  peer: PeerMatch;
  onClose: () => void;
  messages: ChatMessage[];
  isAnonymous: boolean;
  setIsAnonymous: (anonymous: boolean) => void;
  sendMessage: (receiverId: string, message: string) => Promise<ChatMessage | null>;
  deleteChat: (peerId: string) => Promise<boolean>;
  fetchMessages: (peerId: string) => Promise<ChatMessage[]>;
  initializeChat: (peer: PeerMatch, initialMessages?: ChatMessage[]) => Promise<void>;
  subscriptionStatus: string;
  refreshSubscription: () => void;
  error: string | null;
  cleanup: () => void;
  testRealtime: () => Promise<void>;
  isLoading: boolean;
}

export function PeerChat({
  peer,
  onClose,
  messages,
  isAnonymous,
  setIsAnonymous,
  sendMessage,
  deleteChat,
  fetchMessages,
  initializeChat,
  subscriptionStatus,
  refreshSubscription,
  error,
  cleanup,
  testRealtime,
  isLoading
}: PeerChatProps) {
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(messages);
  const [optimisticMessages, setOptimisticMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [showNewMessageNotification, setShowNewMessageNotification] = useState(false);
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const initializedPeerRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio for notifications
  useEffect(() => {
    audioRef.current = new Audio('/notification.mp3');
  }, []);

  // Fetch messages when component mounts
  useEffect(() => {
    console.log("PeerChat opened with peer:", peer);
    
    if (peer && peer.id && initializedPeerRef.current !== peer.id) {
      console.log("Initializing chat for peer:", peer.id);
      initializedPeerRef.current = peer.id;
      
      // Initialize the chat with real-time subscription
      initializeChat(peer, messages)
        .then(() => {
          console.log("Chat initialized successfully");
        })
        .catch((err: any) => {
          console.error("Error initializing chat:", err);
        });
    }
  }, [peer?.id, messages, initializeChat]);

  // Set initial anonymous mode
  useEffect(() => {
    setIsAnonymous(isAnonymous);
  }, [isAnonymous, setIsAnonymous]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      initializedPeerRef.current = null;
      cleanup();
    };
  }, [cleanup]);

  // Update messages when they change from the hook
  useEffect(() => {
    if (messages.length > 0) {
      const previousMessageCount = chatMessages.length;
      setChatMessages(messages);
      
      // Show notification for new messages if user is scrolled up
      if (messages.length > previousMessageCount && userScrolledUp) {
        setShowNewMessageNotification(true);
        // Play notification sound
        if (audioRef.current) {
          audioRef.current.play().catch(console.error);
        }
      }
    }
  }, [messages, userScrolledUp]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (!userScrolledUp) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, userScrolledUp]);

  // Handle scroll position detection
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setUserScrolledUp(!isNearBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !peer || isSending) return;
    
    const messageText = chatMessage.trim();
    setChatMessage('');
    setIsSending(true);
    
    // Add optimistic message
    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      sender: 'you',
      message: messageText,
      timestamp: new Date(),
      isAnonymous
    };
    
    setOptimisticMessages(prev => [...prev, optimisticMessage]);
    
    try {
      // Send to API
      const sentMessage = await sendMessage(peer.id, messageText);
      
      if (sentMessage) {
        // Remove optimistic message and let real-time update handle it
        setOptimisticMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      } else {
        // If sending failed, keep optimistic message but mark as failed
        setOptimisticMessages(prev => 
          prev.map(msg => 
            msg.id === optimisticMessage.id 
              ? { ...msg, message: msg.message + ' (Failed to send)' }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Mark optimistic message as failed
      setOptimisticMessages(prev => 
        prev.map(msg => 
          msg.id === optimisticMessage.id 
            ? { ...msg, message: msg.message + ' (Failed to send)' }
            : msg
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteChat = async () => {
    try {
      console.log(`Attempting to delete chat with peer: ${peer.id}`);
      const success = await deleteChat(peer.id);
      
      if (success) {
        console.log('Chat deletion successful');
        setShowDeleteConfirm(false);
        // Clear local chat messages before closing
        setChatMessages([]);
        onClose();
      } else {
        console.error('Failed to delete chat');
        // Show an error message to the user
        setChatMessages(prev => [
          ...prev, 
          {
            id: `error-${Date.now()}`,
            sender: 'system',
            message: 'Failed to delete chat. Please try again.',
            timestamp: new Date(),
            isAnonymous: false
          }
        ]);
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      console.error('Error in handleDeleteChat:', error);
      // Show an error message to the user
      setChatMessages(prev => [
        ...prev, 
        {
          id: `error-${Date.now()}`,
          sender: 'system',
          message: 'An error occurred while deleting the chat. Please try again.',
          timestamp: new Date(),
          isAnonymous: false
        }
      ]);
      setShowDeleteConfirm(false);
    }
  };

  const handleScrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowNewMessageNotification(false);
  };

  const handleRefreshSubscription = async () => {
    try {
      await refreshSubscription();
    } catch (error) {
      console.error('Error refreshing subscription:', error);
    }
  };

  // Combine real messages with optimistic messages
  const allMessages = [...chatMessages, ...optimisticMessages];

  // Get connection status color and text
  const getConnectionStatus = () => {
    switch (subscriptionStatus) {
      case 'SUBSCRIBED':
        return { color: 'bg-green-500', text: 'Connected' };
      case 'CONNECTING':
        return { color: 'bg-yellow-500', text: 'Connecting...' };
      case 'RETRYING':
        return { color: 'bg-orange-500', text: 'Reconnecting...' };
      case 'CHANNEL_ERROR':
        return { color: 'bg-red-500', text: 'Connection Error' };
      case 'CLOSED':
        return { color: 'bg-gray-400', text: 'Disconnected' };
      default:
        return { color: 'bg-gray-400', text: 'Unknown' };
    }
  };

  const connectionStatus = getConnectionStatus();

  return (
    <div className="h-screen gradient-bg p-6 overflow-hidden">
    <div className="max-w-2xl mx-auto flex flex-col h-full">
      {/* Header section - fixed height */}
      <div className="flex-shrink-0 mb-4">
                  {/* First line: Back button, Name, End Chat button */}
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <button 
                onClick={onClose}
                className="mr-4 text-gray-600 hover:text-blue-500"
              >
                <span className="material-icons">arrow_back</span>
              </button>
              <div className="flex items-center">
                <div className="relative">
                  <span className="text-2xl mr-2">{peer.avatar}</span>
                  {peer.isActive && (
                    <span className="absolute bottom-0 right-0 h-2 w-2 bg-green-600 rounded-full"></span>
                  )}
                </div>
                <h2 className="font-semibold text-gray-900">{peer.name}</h2>
                {/* Real-time connection indicator */}
                 <div className="ml-2 flex items-center">
                  {/* <div className={`w-2 h-2 rounded-full mr-1 ${connectionStatus.color}`}></div>
                  <span className="text-xs text-gray-500">
                    {connectionStatus.text}
                  </span> */}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
             {/* <Button
                onClick={() => {
                  console.log('Manual refresh triggered');
                  fetchMessages(peer.id);
                }}
                variant="outline"
                size="sm"
                className="text-blue-500 hover:bg-blue-50 border-blue-200"
                disabled={isLoading}
              >
                <span className="material-icons mr-1 text-sm">refresh</span>
                Refresh
              </Button>
              <Button
                onClick={handleRefreshSubscription}
                variant="outline"
                size="sm"
                className="text-green-500 hover:bg-green-50 border-green-200"
                disabled={subscriptionStatus === 'SUBSCRIBED' || subscriptionStatus === 'CONNECTING'}
              >
                <span className="material-icons mr-1 text-sm">wifi</span>
                Reconnect
              </Button>
              <Button
                onClick={testRealtime}
                variant="outline"
                size="sm"
                className="text-purple-500 hover:bg-purple-50 border-purple-200"
              >
                <span className="material-icons mr-1 text-sm">bug_report</span>
                Test RT
              </Button>   */}
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                variant="outline"
                size="sm"
                className="text-red-500 hover:bg-red-50 border-red-200"
              >
                <span className="material-icons mr-1 text-sm">delete</span>
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                size="sm"
              >
                End Chat
              </Button>
            </div>
          </div>
          
          {/* Second line: Ratings and Anonymous toggle */}
          <div className="flex justify-between items-center ml-10 pl-2">
            <div className="flex items-center">
              <label className="text-sm text-gray-600 mr-2">Anonymous:</label>
              <div 
                className={`w-10 h-5 rounded-full flex items-center cursor-pointer transition-colors ${
                  isAnonymous ? 'bg-blue-500' : 'bg-gray-300'
                }`}
                onClick={() => setIsAnonymous(!isAnonymous)}
              >
                <div 
                  className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
                    isAnonymous ? 'translate-x-5' : 'translate-x-1'
                  }`} 
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Error display */}
        {error && (
  <div className="flex-shrink-0 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        {/* Delete confirmation modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-4">Delete Chat</h3>
              <p className="mb-6">
                Are you sure you want to delete this conversation? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteChat}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Shared journeys info */}
        {peer.supportPreferences.length > 0 && (
          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-gray-600 mb-2">Areas of experience:</p>
            <div className="flex flex-wrap gap-2">
              {peer.supportPreferences.map((area: string, i: number) => (
                <span 
                  key={i}
                  className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}
        
 {/* Chat messages - scrollable area */}
 <div className="flex-1 bg-white rounded-lg shadow-sm p-4 overflow-y-auto mb-4 relative min-h-0" ref={messagesContainerRef}>
    {allMessages.map((msg, index) => (
            <div 
              key={msg.id || index} 
              className={`mb-4 ${msg.sender === 'you' ? 'text-right' : ''} ${msg.sender === 'system' ? 'text-center' : ''}`}
            >
              {msg.sender !== 'system' && (
                <div className="text-xs text-gray-500 mb-1">
                  {msg.sender === 'you' ? (msg.isAnonymous ? 'Anonymous' : 'You') : msg.sender}
                  {msg.isAnonymous && msg.sender !== 'you' && " (Anonymous)"}
                </div>
              )}
              <div 
                className={`inline-block rounded-lg px-4 py-2 max-w-[80%] text-left ${
                  msg.sender === 'you' 
                    ? 'bg-blue-500 text-white' 
                    : msg.sender === 'system'
                      ? 'bg-gray-200 text-gray-700 text-sm text-center'
                      : msg.message.includes('(Failed to send)')
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-800'
                }`}
              >
                {msg.message}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
          
          {/* New message notification */}
          {showNewMessageNotification && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <Button
                onClick={handleScrollToBottom}
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
              >
                <span className="material-icons mr-1 text-sm">keyboard_arrow_down</span>
                New Messages
              </Button>
            </div>
          )}
        </div>
        
         {/* Message input - fixed at bottom */}
         <div className="flex-shrink-0 flex items-center bg-white rounded-lg shadow-sm p-2">
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder={isAnonymous ? "Type anonymously..." : "Type your message..."}
            className="flex-1 p-2 border-none focus:outline-none focus:ring-0"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isSending || subscriptionStatus === 'CHANNEL_ERROR'}
          />
          <button
            onClick={handleSendMessage}
            disabled={!chatMessage.trim() || isSending || subscriptionStatus === 'CHANNEL_ERROR'}
            className={`p-2 rounded-full ${
              !chatMessage.trim() || isSending || subscriptionStatus === 'CHANNEL_ERROR' 
                ? 'text-gray-400' 
                : 'text-blue-500 hover:text-blue-600'
            }`}
          >
            <span className="material-icons">
              {isSending ? 'hourglass_empty' : 'send'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
