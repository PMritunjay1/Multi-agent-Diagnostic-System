import React, { useState, useRef, useEffect } from 'react';
import { Chat, GenerateContentResponse } from '@google/genai';
import { getChatSession } from '../services/geminiService';
import { LogoIcon } from './icons';
import { marked } from 'marked';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ChatBotProps {
  context: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ context, isOpen, setIsOpen }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hello! I'm your Health Insights assistant. I've reviewed the case files. How can I help you understand the diagnosis?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (context && !chatSession) {
      setChatSession(getChatSession(context));
    }
  }, [context, chatSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chatSession) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const result = await chatSession.sendMessageStream({ message: userMessage });
      
      let fullResponse = '';
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        const text = c.text;
        if (text) {
            fullResponse += text;
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text = fullResponse;
                return newMessages;
            });
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, I encountered an error while processing your request. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[90] bg-[var(--c-primary)] hover:bg-[var(--c-primary-dark)] text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 group flex items-center gap-2 animate-slideInBottom"
      >
        <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="absolute top-0 right-0 block h-3 w-3 transform -translate-y-1/2 translate-x-1/2 rounded-full ring-2 ring-white bg-green-400 animate-pulse"></span>
        </div>
        <span className="font-bold pr-2 pl-1 hidden group-hover:inline-block transition-all whitespace-nowrap">Health Chat</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] w-96 max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-slideInBottom ring-1 ring-black/5">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--c-primary)] to-blue-600 p-4 flex justify-between items-center text-white shadow-md">
        <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <LogoIcon className="w-5 h-5 text-white" />
            </div>
            <div>
                <h3 className="font-bold text-sm tracking-wide">Health Insights AI</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-medium opacity-90 uppercase tracking-wider">Context Active</span>
                </div>
            </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed ${
                msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
            }`}>
                {msg.role === 'model' ? (
                    <div className="prose prose-sm max-w-none prose-p:m-0 prose-ul:m-0 prose-li:m-0 prose-strong:text-slate-900" dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) as string }} />
                ) : (
                    msg.text
                )}
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your medical question..."
          className="flex-grow px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-all text-slate-800 placeholder:text-slate-400"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatBot;