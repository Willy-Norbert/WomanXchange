
import React, { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, MessageSquare, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getChatMessages, createChatMessage, ChatMessage } from '@/api/chat';
import { useToast } from '@/hooks/use-toast';

const CommunityChat = () => {
  const { user } = useContext(AuthContext);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
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
    queryFn: async () => {
      console.log('Fetching chat messages...');
      const response = await getChatMessages();
      console.log('Chat messages response:', response);
      return response;
    },
    refetchInterval: 5000, // Refetch every 5 seconds for real-time feel
    enabled: !!user && (user.role === 'admin' || user.role === 'seller')
  });

  const createMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      console.log('Sending message:', message);
      const response = await createChatMessage(message);
      console.log('Message sent response:', response);
      return response;
    },
    onSuccess: (data) => {
      console.log('Message created successfully:', data);
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
      toast({
        title: t('message_sent'),
        description: t('message_posted'),
      });
      scrollToBottom();
    },
    onError: (error: any) => {
      console.error('Error sending message:', error);
      const errorMessage = error.response?.data?.message || error.message || t('failed_send_message');
      toast({
        title: t('error'),
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  // Extract messages from response - handle both direct array and data wrapper
  const messages = Array.isArray(messagesData) ? messagesData : (messagesData?.data || []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && !createMessageMutation.isPending) {
      createMessageMutation.mutate(newMessage.trim());
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!user || user.role === 'buyer') {
    return null;
  }

  if (isLoading) {
    return (
      <DashboardLayout currentPage="community-chat">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-gray-600">{t('loading_chat')}</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    console.error('Chat error:', error);
    return (
      <DashboardLayout currentPage="community-chat">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-red-600">
            {t('failed_load_chat')}
            <Button onClick={() => refetch()} className="ml-2">
              <RefreshCw className="w-4 h-4 mr-1" />
              {t('retry')}
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
              {t('community_chat')}
            </h1>
          </div>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-1" />
            {t('refresh')}
          </Button>
        </div>
        
        <Card className="flex-1 flex flex-col h-[calc(100vh-200px)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium text-gray-800">
              {t('discussion_vendors')} ({messages.length} {t('messages')})
            </CardTitle>
            <p className="text-sm text-gray-600">
              {t('share_ideas')}
            </p>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {messages.length > 0 ? (
                messages.map((message: ChatMessage) => (
                  <div key={message.id} className="flex space-x-3">
                    <div className="w-10 h-10 bg-purple-400 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                      {message.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">{message.user.name}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          message.user.role.toLowerCase() === 'admin' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {message.user.role.toLowerCase() === 'admin' ? t('admin') : t('vendor_role')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.createdAt).toLocaleString()}
                        </span>
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
                    <p className="text-gray-500">{t('no_messages')}</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-6 border-t bg-white">
              <form onSubmit={handleSendMessage} className="flex space-x-3">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={t('type_message')}
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
                {newMessage.length}/500 {t('characters')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CommunityChat;
