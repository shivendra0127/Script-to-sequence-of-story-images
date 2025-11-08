
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { SendIcon } from './icons/SendIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { Chat, GenerateContentResponse } from '@google/genai';

interface ChatBotProps {
  getChat: () => Chat;
}

export const ChatBot: React.FC<ChatBotProps> = ({ getChat }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        const chat = getChat();
        const result: GenerateContentResponse = await chat.sendMessage({ message: input });
        
        const botMessage: ChatMessage = { role: 'model', parts: [{ text: result.text }] };
        setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = { role: 'model', parts: [{ text: "Sorry, I encountered an error. Please try again." }] };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface rounded-lg shadow-lg p-6 flex flex-col h-[30rem] max-h-[70vh]">
      <h2 className="text-xl font-bold text-white mb-4">Chat with Gemini</h2>
      <div className="flex-grow overflow-y-auto mb-4 pr-2 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-sm rounded-lg px-4 py-2 ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-brand-bg text-text-main'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.parts[0].text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex items-center gap-2 border-t border-border-color pt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question..."
          className="flex-grow bg-brand-bg border border-border-color rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="bg-primary text-white p-2 rounded-lg hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isLoading ? <SpinnerIcon className="w-5 h-5" /> : <SendIcon className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};
