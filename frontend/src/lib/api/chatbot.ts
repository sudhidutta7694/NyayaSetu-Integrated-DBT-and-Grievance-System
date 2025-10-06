import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatbotApi = {
  sendMessage: async (message: string, sessionId?: string): Promise<string> => {
    const response = await api.post('/chatbot/message', {
      message,
      session_id: sessionId || null,
    });
    // Assuming response shape: { reply: string }
    return response.data.reply || 'Sorry, I could not understand your question.';
  },
};
