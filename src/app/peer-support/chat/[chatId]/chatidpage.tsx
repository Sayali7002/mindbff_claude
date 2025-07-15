'use client'

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { PeerMatch, ChatMessage } from '@/types/peer-support';
import { usePeerChat } from '@/hooks/peer-support/usePeerChat';
import { PeerChat } from '../../components/PeerChat';
import { supabase } from '@/lib/supabase';
import { getPeerIdFromChatId, isValidChatId } from '@/lib/peer-support/utils';

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const chatId = params.chatId as string;
  
  const [peer, setPeer] = useState<PeerMatch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user, loading: authLoading } = useAuth();
  const {
    selectedPeer,
    messages,
    isLoading: isChatLoading,
    error: chatError,
    isAnonymous,
    setIsAnonymous,
    fetchMessages,
    sendMessage,
    initializeChat,
    cleanup
  } = usePeerChat();

  // Validate chat ID format
  if (!isValidChatId(chatId)) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Invalid Chat URL</h2>
          <p className="text-gray-600 mb-4">The chat URL is not properly formatted.</p>
          <button
            onClick={() => router.push('/peer-support')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Back to Peer Support
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const initializeChatFromUrl = async () => {
      if (!user?.id || !chatId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Get peer ID from chat ID
        const peerId = getPeerIdFromChatId(chatId, user.id);
        if (!peerId) {
          setError('Invalid chat ID');
          setIsLoading(false);
          return;
        }

        // Get session for auth token
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error('No authentication token available');
        }

        // Fetch peer information
        const response = await fetch(`/api/peer-support/chats?peer_id=${peerId}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch peer information');
        }

        const data = await response.json();
        
        // Create peer object
        const peerData: PeerMatch = {
          id: peerId,
          name: data.peer?.name || 'Unknown Peer',
          avatar: data.peer?.avatar || '😊',
          matchScore: 0,
          supportPreferences: data.peer?.experienceAreas || [],
          supportType: data.peer?.supportType || 'unknown',
          location: data.peer?.location || '',
          isActive: data.peer?.isActive || false,
          rating: 0,
          totalRatings: 0,
          certifiedMentor: false
        };

        setPeer(peerData);
        
        // Initialize chat with real-time subscription
        await initializeChat(peerData, data.messages || []);
        
      } catch (err) {
        console.error('Error initializing chat:', err);
        setError(err instanceof Error ? err.message : 'Failed to load chat');
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading && user) {
      initializeChatFromUrl();
    }
  }, [chatId, user, authLoading, initializeChat]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || chatError) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Error Loading Chat</h2>
          <p className="text-gray-600 mb-4">{error || chatError}</p>
          <button
            onClick={() => router.push('/peer-support')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Back to Peer Support
          </button>
        </div>
      </div>
    );
  }

  if (!peer) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Chat Not Found</h2>
          <p className="text-gray-600 mb-4">This chat doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => router.push('/peer-support')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Back to Peer Support
          </button>
        </div>
      </div>
    );
  }

  return (
    <PeerChat 
      peer={peer}
      onClose={() => router.push('/peer-support')}
      initialMessages={messages}
      initialIsAnonymous={isAnonymous}
    />
  );
} 