
import React, { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, MessageSquare } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getChatMessages, createChatMessage, ChatMessage } from '@/api/chat';
import { useToast } from '@/hooks/use-toast';

const CommunityChat = () => {
  const { user } = useContext(AuthContext);
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

  const { data: messagesData, isLoading, error } = useQuery({
    queryKey: ['chat-messages'],
    queryFn: getChatMessages,
    refetchInterval: 3000, // Refetch every 3 seconds for real-time feel
    enabled: !!user && (user.role === 'admin' || user.role === 'seller')
  });

  const createMessageMutation = useMutation({
    mutationFn: createChatMessage,
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
      toast({
        title: "Message sent",
        description: "Your message has been posted to the community chat.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  });

  const messages = messagesData?.data || [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && !createMessageMutation.isPending) {
      createMessageMutation.mutate(newMessage.trim());
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
          <div className="text-lg text-gray-600">Loading chat...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout currentPage="community-chat">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-red-600">Failed to load chat messages</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="community-chat">
      <div className="h-full flex flex-col space-y-6">
        <div className="flex items-center space-x-3">
          <MessageSquare className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Community Chat
          </h1>
        </div>
        
        <Card className="flex-1 flex flex-col h-[calc(100vh-200px)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium text-gray-800">
              Discussion for Vendors & Admins
            </CardTitle>
            <p className="text-sm text-gray-600">
              Share ideas, ask questions, and collaborate with other vendors and administrators.
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
                          message.user.role === 'admin' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {message.user.role === 'admin' ? 'Admin' : 'Vendor'}
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
                    <p className="text-gray-500">No messages yet. Start the conversation!</p>
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
                  placeholder="Type your message..."
                  className="flex-1"
                  disabled={createMessageMutation.isPending}
                />
                <Button 
                  type="submit" 
                  disabled={!newMessage.trim() || createMessageMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CommunityChat;
