// CommunityChat.tsx
import React, { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, MessageSquare, RefreshCw, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getChatMessages, createChatMessage, ChatMessage, deleteChatMessage } from '@/api/chat';
import { useToast } from '@/hooks/use-toast';

const CommunityChat = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'buyer') {
      navigate('/');
    }
  }, [user, navigate]);

  const { data: messagesData, isLoading, error, refetch } = useQuery({
    queryKey: ['chat-messages'],
    queryFn: getChatMessages,
    refetchInterval: 2000, // refresh every 2 seconds
    enabled: !!user && (user.role === 'admin' || user.role === 'seller'),
    staleTime: 1000,
  });

  const createMessageMutation = useMutation({
    mutationFn: createChatMessage,
    onMutate: async (newMessageText) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['chat-messages'] });
      const previousMessages = queryClient.getQueryData(['chat-messages']);

      queryClient.setQueryData(['chat-messages'], (old: any) => ({
        ...old,
        data: [
          ...(old?.data || []),
          {
            id: Math.random(),
            message: newMessageText,
            user: user,
            userId: user.id,
            createdAt: new Date().toISOString(),
          },
        ],
      }));

      return { previousMessages };
    },
    onSettled: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
    },
    onError: (error: any, _, context) => {
      queryClient.setQueryData(['chat-messages'], context?.previousMessages);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: deleteChatMessage,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete message",
        variant: "destructive",
      });
    }
  });

  const messages = Array.isArray(messagesData) ? messagesData : (messagesData?.data || []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && !createMessageMutation.isPending) {
      createMessageMutation.mutate(newMessage.trim());
    }
  };

  const handleDeleteMessage = (messageId: number) => {
    deleteMessageMutation.mutate(messageId);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!user || user.role === 'buyer') return null;

  if (isLoading) {
    return (
      <DashboardLayout currentPage="community-chat">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout currentPage="community-chat">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-red-600">
            Failed to load chat messages
            <Button onClick={() => refetch()} className="ml-2">
              <RefreshCw className="w-4 h-4 mr-1" />
              Retry
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="community-chat">
      <div className="h-full flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Community Chat
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live</span>
            </div>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </div>
        </div>

        <Card className="flex-1 flex flex-col h-[calc(100vh-200px)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium text-gray-800">
              Discussion for Vendors & Admins ({messages.length} messages)
            </CardTitle>
            <p className="text-sm text-gray-600">
              Share ideas, ask questions, and collaborate with other vendors and administrators.
            </p>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {messages.length > 0 ? (
                messages.map((message: ChatMessage) => (
                  <div key={message.id} className="flex space-x-3">
                    <div className="w-10 h-10 bg-purple-400 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                      {message.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">{message.user?.name?.split(' ')[0]}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          message.user?.role?.toLowerCase() === 'admin'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {message.user?.role?.toLowerCase() === 'admin' ? 'Admin' : 'Vendor'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.createdAt).toLocaleString()}
                        </span>
                        {(message.userId === user.id || user.role === 'admin') && (
                          <button 
                            onClick={() => handleDeleteMessage(message.id)}
                            disabled={deleteMessageMutation.isPending}
                            className="text-red-500 hover:text-red-700 text-xs disabled:opacity-50"
                          >
                            {deleteMessageMutation.isPending ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-500"></div>
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm border">
                        <p className="text-gray-800">{message.message}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No messages yet. Start the conversation!</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="p-6 border-t bg-white">
              <form onSubmit={handleSendMessage} className="flex space-x-3">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                  disabled={createMessageMutation.isPending}
                  maxLength={500}
                />
                <Button 
                  type="submit" 
                  disabled={!newMessage.trim() || createMessageMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  {createMessageMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
              <p className="text-xs text-gray-500 mt-2">
                {newMessage.length}/500 characters
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CommunityChat;
