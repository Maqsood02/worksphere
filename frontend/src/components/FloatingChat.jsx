import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';

export default function FloatingChat() {
  const { user, addToast } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Sync AI messages list
  const syncChatHistory = async () => {
    if (!user) return;
    try {
      const data = await api.getChatHistory('ai');
      if (data && data.success && Array.isArray(data.history)) {
        setMessages(data.history);
      } else if (Array.isArray(data)) {
        setMessages(data);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.warn("Chat history fallback note:", err);
      setMessages([]);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      syncChatHistory();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    if (!user) {
      addToast("Please register or log in to use the AI Co-Pilot.");
      return;
    }

    const clientMsg = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      const data = await api.sendMessage('ai', clientMsg);
      if (data && data.success) {
        setTimeout(async () => {
          setIsTyping(false);
          await syncChatHistory();
        }, 500);
      } else {
        setIsTyping(false);
        await syncChatHistory();
      }
    } catch (err) {
      setIsTyping(false);
      await syncChatHistory();
    }
  };

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[100] flex flex-col items-end pointer-events-auto">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-white w-[calc(100vw-2.5rem)] sm:w-[370px] max-w-[370px] h-[450px] max-h-[calc(100vh-6.5rem)] rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden mb-3.5 z-[100]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-4 text-white flex items-center justify-between shadow-sm relative z-10 select-none">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold">
                    <Bot className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-indigo-700 rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-poppins font-bold text-sm tracking-tight text-white">AI Co-Pilot</h3>
                  <p className="text-[10px] text-indigo-100 font-medium">Online • Intelligent Assistant</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-white/80 hover:text-white hover:bg-white/20 p-1.5 rounded-xl transition-colors cursor-pointer"
                title="Close Chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 text-xs">
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm text-text-dark max-w-[80%]">
                  👋 Hello! I am your AI Co-Pilot. I can answer questions about freelance pricing, coupons, active projects status, or tech stacks!
                </div>
              </div>

              {(messages || []).map((msg, idx) => {
                const isAi = msg.senderId === 'ai';
                return (
                  <div key={idx} className={`flex items-start space-x-2 ${!isAi ? 'justify-end text-right' : ''}`}>
                    {isAi && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <div className={`p-3 rounded-2xl shadow-sm max-w-[80%] inline-block text-left ${isAi ? 'bg-white text-text-dark rounded-tl-none border border-slate-100' : 'bg-primary text-white rounded-tr-none ml-auto'}`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center space-x-2 bg-slate-50">
                  <span className="text-[10px] text-text-light italic">AI is writing a reply</span>
                  <div className="flex space-x-1">
                    <span className="w-1.5 h-1.5 bg-text-light rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-1.5 h-1.5 bg-text-light rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1.5 h-1.5 bg-text-light rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-100 bg-white flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={user ? "Ask about 'price', 'coupon', 'status'..." : "Register or login to speak..."}
                disabled={!user}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-primary/50 text-xs text-text-dark"
              />
              <button onClick={handleSend} disabled={!user} className="bg-primary text-white p-2.5 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-primary via-accent to-secondary text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 relative group"
      >
        <MessageSquare className="w-6 h-6 transition-transform group-hover:rotate-6" />
      </button>
    </div>
  );
}
