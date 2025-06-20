
import api from './api';

export interface ChatMessage {
  id: number;
  message: string;
  userId: number;
  createdAt: string;
  user: {
    id: number;
    name: string;
    role: string;
  };
}

export const getChatMessages = async () => {
  const response = await api.get('/chat/messages');
  return response.data;
};

export const createChatMessage = async (message: string) => {
  const response = await api.post('/chat/messages', { message });
  return response.data;
};
