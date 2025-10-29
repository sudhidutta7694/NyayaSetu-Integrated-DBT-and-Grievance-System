"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { chatbotApi, ChatMessage } from '@/lib/api/chatbot';
import { MessageSquare, X, Mic, Loader2, Info } from 'lucide-react';
import { tokenStorage } from '@/lib/tokenStorage';

// Helper function to format chatbot response with rich text
const formatResponse = (text: string) => {
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (!trimmedLine) {
      elements.push(<div key={`br-${index}`} className="h-2" />);
      return;
    }
    
    // Handle headings (lines ending with :)
    if (trimmedLine.endsWith(':') && trimmedLine.length < 100) {
      elements.push(
        <div key={index} className="font-bold text-orange-800 mt-3 mb-1.5 text-sm">
          {trimmedLine}
        </div>
      );
      return;
    }
    
    // Handle bullet points
    if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
      const content = trimmedLine.substring(1).trim();
      elements.push(
        <div key={index} className="flex gap-2.5 ml-1 mb-1.5 items-start">
          <span className="text-orange-600 font-bold flex-shrink-0 mt-0.5">•</span>
          <span className="flex-1">{formatInlineText(content)}</span>
        </div>
      );
      return;
    }
    
    // Handle asterisk bullet points (from markdown)
    if (trimmedLine.startsWith('*') && !trimmedLine.startsWith('**')) {
      const content = trimmedLine.substring(1).trim();
      elements.push(
        <div key={index} className="flex gap-2.5 ml-1 mb-1.5 items-start">
          <span className="text-orange-600 font-bold flex-shrink-0 mt-0.5">•</span>
          <span className="flex-1">{formatInlineText(content)}</span>
        </div>
      );
      return;
    }
    
    // Handle numbered lists
    const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)/);
    if (numberedMatch) {
      elements.push(
        <div key={index} className="flex gap-2.5 ml-1 mb-1.5 items-start">
          <span className="text-orange-700 font-semibold flex-shrink-0 min-w-[1.25rem]">
            {numberedMatch[1]}.
          </span>
          <span className="flex-1">{formatInlineText(numberedMatch[2])}</span>
        </div>
      );
      return;
    }
    
    // Regular paragraph
    elements.push(
      <div key={index} className="mb-1.5 leading-relaxed">
        {formatInlineText(trimmedLine)}
      </div>
    );
  });
  
  return <div className="space-y-0.5">{elements}</div>;
};

// Helper function to format inline text (bold, etc.)
const formatInlineText = (text: string) => {
  const parts: (string | JSX.Element)[] = [];
  let currentIndex = 0;
  let keyCounter = 0;
  
  // Match bold text patterns like **text** or __text__
  const boldPattern = /\*\*(.+?)\*\*|__(.+?)__/g;
  let match;
  
  while ((match = boldPattern.exec(text)) !== null) {
    // Add text before the match
    if (match.index > currentIndex) {
      parts.push(text.substring(currentIndex, match.index));
    }
    
    // Add bold text with stronger styling
    const boldText = match[1] || match[2];
    parts.push(
      <strong key={`bold-${keyCounter++}`} className="font-bold text-gray-900 bg-orange-50/50 px-0.5 rounded">
        {boldText}
      </strong>
    );
    
    currentIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (currentIndex < text.length) {
    parts.push(text.substring(currentIndex));
  }
  
  return parts.length > 0 ? parts : text;
};

const ChatbotWidget: React.FC = () => {
  const t = useTranslations('chatbot');
  const locale = useLocale(); // Get current locale from next-intl
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{
    from: 'bot' | 'user';
    text: string;
    queryType?: 'general' | 'user_specific';
    confidence?: number;
  }>>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [listening, setListening] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}`);

  // Check login status
  useEffect(() => {
    setIsLoggedIn(tokenStorage.hasToken());
  }, []);

  // Initialize greeting message
  useEffect(() => {
    if (!isInitialized && open) {
      const greeting = isLoggedIn
        ? t('greetingLoggedIn')
        : t('greetingGuest');
      
      setMessages([{ from: 'bot', text: greeting }]);
      setIsInitialized(true);
    }
  }, [t, isInitialized, open, isLoggedIn]);

  // Voice input (speech-to-text)
  const handleVoiceInput = () => {
    if (typeof window === 'undefined' || !(window as any).webkitSpeechRecognition) {
      alert(t('voiceInputNotSupported'));
      return;
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = input;
    setMessages(prev => [...prev, { from: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    console.log('Sending message with locale:', locale); // Debug log

    try {
      // Send message with chat history and language
      const response = await chatbotApi.sendMessage(
        userMessage,
        chatHistory,
        sessionId,
        locale // Use locale from next-intl
      );

      // Update chat history
      const newHistory: ChatMessage[] = [
        ...chatHistory,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: response.reply }
      ];
      setChatHistory(newHistory);

      // Add bot response
      setMessages(msgs => [
        ...msgs,
        {
          from: 'bot',
          text: response.reply,
          queryType: response.query_type,
          confidence: response.classification_confidence
        }
      ]);

      // Note: Login message is already included in response.reply from backend
      // No need to add a separate tip message here

    } catch (err) {
      console.error('Chatbot error:', err);
      setMessages(msgs => [
        ...msgs,
        { from: 'bot', text: t('error') || 'Sorry, I encountered an error. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (open && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  return (
    <>
      {/* Floating Button */}
      <button
        className="fixed bottom-6 right-6 z-50 bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center focus:outline-none transition-transform hover:scale-110"
        onClick={() => setOpen(true)}
        aria-label={t('open')}
        style={{ display: open ? 'none' : 'flex' }}
      >
        <MessageSquare className="h-7 w-7" />
      </button>
      
      {/* Chatbot Window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-full bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-orange-200 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <div>
                <span className="font-semibold block">{t('title')}</span>
                <span className="text-xs opacity-90">
                  {isLoggedIn ? t('personalAssistant') : t('generalAssistant')}
                </span>
              </div>
            </div>
            <button 
              onClick={() => setOpen(false)} 
              aria-label={t('close')}
              className="hover:bg-white/20 rounded p-1 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Status Banner */}
          {!isLoggedIn && (
            <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 text-xs text-blue-800 flex items-center gap-2">
              <Info className="h-4 w-4 flex-shrink-0" />
              <span>{t('loginPrompt')}</span>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-96 bg-gradient-to-b from-orange-50/30 to-white">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'} items-start gap-2`}>
                {msg.from === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <MessageSquare className="h-4 w-4 text-orange-600" />
                  </div>
                )}
                <div className={`px-3 py-2 rounded-lg text-sm max-w-[80%] ${
                  msg.from === 'user' 
                    ? 'bg-orange-600 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 border border-orange-100 rounded-bl-none shadow-sm'
                }`}>
                  {msg.from === 'user' ? (
                    <span className="whitespace-pre-wrap">{msg.text}</span>
                  ) : (
                    formatResponse(msg.text)
                  )}
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-start items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-4 w-4 text-orange-600" />
                </div>
                <div className="px-3 py-2 rounded-lg bg-white border border-orange-100 shadow-sm">
                  <Loader2 className="h-4 w-4 text-orange-600 animate-spin" />
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex items-center gap-2 p-3 border-t bg-white">
            <button
              className={`p-2 rounded hover:bg-orange-50 transition-colors ${listening ? 'bg-orange-100' : ''}`}
              aria-label={t('voiceInput')}
              onClick={handleVoiceInput}
              disabled={listening || loading}
            >
              <Mic className={`h-5 w-5 ${listening ? 'animate-pulse text-orange-700' : 'text-orange-600'}`} />
            </button>
            <input
              className="flex-1 border border-orange-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              type="text"
              placeholder={t('placeholder') || 'Ask me anything...'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading ? handleSend() : undefined}
              disabled={loading}
            />
            <button
              className="bg-orange-600 hover:bg-orange-700 text-white p-2 rounded-lg font-semibold flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSend}
              aria-label={t('send')}
              disabled={loading || !input.trim()}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m0 0l-6-6m6 6l-6 6" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;

