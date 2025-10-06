import React from 'react';
import dynamic from 'next/dynamic';

const ChatbotWidget = dynamic(() => import('@/components/chatbot/ChatbotWidget'), { ssr: false });

const ChatbotGlobal: React.FC = () => {
  return <ChatbotWidget />;
};

export default ChatbotGlobal;
