import axios from 'axios';
import { tokenStorage } from '../tokenStorage';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: `${API_BASE_URL}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatbotResponse {
  reply: string;
  query_type: 'general' | 'user_specific';
  classification_confidence: number;
  requires_login: boolean;
}

export const chatbotApi = {
  sendMessage: async (
    message: string,
    chatHistory?: ChatMessage[],
    sessionId?: string,
    language?: string
  ): Promise<ChatbotResponse> => {
    // Get auth token if available
    const token = tokenStorage.getToken();
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await api.post(
      '/chatbot/message',
      {
        message,
        chat_history: chatHistory || [],
        session_id: sessionId || null,
        language: language || 'en',
      },
      { headers }
    );
    
    return response.data;
  },
};

