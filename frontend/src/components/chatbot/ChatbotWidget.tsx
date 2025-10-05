"use client";
import React, { useState, useRef, useEffect } from 'react';
import { chatbotApi } from '@/lib/api/chatbot';
import { useLanguage } from '@/contexts/LanguageContext';
import { MessageSquare, X, Mic, Volume2 } from 'lucide-react';

const ChatbotWidget: React.FC = () => {
  const { t, currentLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { from: 'bot', text: t('chatbot.greeting', 'Hello! How can I help you with the NyayaSetu portal?') }
  ]);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const speak = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const utter = new window.SpeechSynthesisUtterance(text);
    // Try to set language for TTS
    utter.lang = currentLanguage || 'en-IN';
    window.speechSynthesis.speak(utter);
  };

  // Voice input (speech-to-text)
  const handleVoiceInput = () => {
    if (typeof window === 'undefined' || !(window as any).webkitSpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = currentLanguage || 'en-IN';
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
    if (!input.trim()) return;
    const userMessage = input;
    setMessages(prev => [...prev, { from: 'user', text: userMessage }]);
    setInput('');
    try {
      const reply = await chatbotApi.sendMessage(userMessage);
      setMessages(msgs => [
        ...msgs,
        { from: 'bot', text: reply }
      ]);
    } catch (err) {
      setMessages(msgs => [
        ...msgs,
        { from: 'bot', text: t('chatbot.error', 'Sorry, I could not get a response. Please try again later.') }
      ]);
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
        className="fixed bottom-6 right-6 z-50 bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center focus:outline-none"
        onClick={() => setOpen(true)}
        aria-label="Open Chatbot"
        style={{ display: open ? 'none' : 'flex' }}
      >
        <MessageSquare className="h-7 w-7" />
      </button>
      {/* Chatbot Window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-80 max-w-full bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-orange-200 animate-fade-in">
          <div className="flex items-center justify-between bg-orange-600 text-white px-4 py-3">
            <span className="font-semibold">NyayaSetu Chatbot</span>
            <button onClick={() => setOpen(false)} aria-label="Close Chatbot">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-80 bg-orange-50/20">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'} items-center`}>
                <div className={`px-3 py-2 rounded-lg text-sm max-w-[80%] ${msg.from === 'user' ? 'bg-orange-100 text-gray-900' : 'bg-white text-gray-700 border border-orange-100'} flex items-center`}>
                  <span>{msg.text}</span>
                  {msg.from === 'bot' && (
                    <div className="relative group ml-2">
                      <button
                        className="p-1 rounded border border-orange-200 bg-white hover:bg-orange-100 transition-colors flex items-center justify-center"
                        aria-label="Voice Output"
                        onClick={() => speak(msg.text)}
                        tabIndex={0}
                      >
                        <Volume2 className="h-4 w-4 text-orange-600" />
                      </button>
                      <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        Voice Out
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="flex items-center gap-2 p-3 border-t bg-white">
            <button
              className={`p-2 rounded hover:bg-orange-50 ${listening ? 'bg-orange-100' : ''}`}
              aria-label="Voice Input"
              onClick={handleVoiceInput}
              disabled={listening}
            >
              <Mic className={`h-5 w-5 ${listening ? 'animate-pulse text-orange-700' : 'text-orange-600'}`} />
            </button>
            <input
              className="flex-1 border border-orange-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
              type="text"
              placeholder={t('chatbot.inputPlaceholder', 'Type your question...')}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' ? handleSend() : undefined}
            />
            <button
              className="bg-orange-600 hover:bg-orange-700 text-white p-2 rounded-lg font-semibold flex items-center justify-center"
              onClick={handleSend}
              aria-label="Send"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m0 0l-6-6m6 6l-6 6" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
