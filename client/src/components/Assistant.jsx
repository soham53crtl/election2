import React, { useState, useEffect, useRef } from 'react';
import { Bot, User, Send, Loader2, Trash2, RefreshCcw } from 'lucide-react';
import { useAssistant } from '../hooks/useAssistant';

/**
 * AI Assistant Component
 * UI layer for interacting with the Gemini AI service.
 * Uses useAssistant hook for core logic.
 */
const Assistant = React.memo(({ user }) => {
  const { messages, isLoading, sendMessage, clearMessages, setMessages } = useAssistant([
    { 
      sender: 'bot', 
      text: `Namaste ${user?.displayName?.split(' ')[0] || ''}! I'm your AI Election Guide. How can I help you today?` 
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue('');
  };

  const handleRetry = (msg) => {
    setMessages(prev => prev.slice(0, -1)); // Remove error
    sendMessage(msg.retryText);
  };

  return (
    <section className="glass-card assistant-container flex flex-col h-full animate-fade-in" aria-label="AI Assistant">
      <div className="assistant-header flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold font-heading">Civic AI Assistant</h2>
          <p className="text-xs text-gray-400">Secure Session • {user?.email}</p>
        </div>
        <button 
          onClick={clearMessages} 
          className="btn-secondary p-2 rounded-full hover:bg-white/10 transition-colors" 
          title="Clear Conversation"
        >
          <Trash2 size={18} />
        </button>
      </div>
      
      <div className="chat-box flex-1 overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: '450px' }}>
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
            <div className={`flex max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
              <div className={`avatar w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg ${
                msg.sender === 'bot' ? 'bg-indigo-600' : 'bg-gray-700'
              }`}>
                {msg.sender === 'bot' ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className="msg-wrapper">
                <div 
                  className={`msg-bubble p-3 rounded-2xl text-sm transition-all duration-300 ${
                    msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white/5 border border-white/10 rounded-tl-none'
                  } ${msg.isError ? 'border-red-500/50 text-red-200 bg-red-500/10' : ''}`}
                  dangerouslySetInnerHTML={{ __html: msg.text }}
                />
                {msg.isError && (
                  <button 
                    onClick={() => handleRetry(msg)}
                    className="flex items-center gap-1 text-xs text-indigo-400 mt-2 hover:text-indigo-300 transition-colors font-medium"
                  >
                    <RefreshCcw size={12} /> Retry request
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && !messages[messages.length-1]?.isStreaming && (
          <div className="chat-msg mb-4 flex justify-start animate-pulse">
            <div className="flex gap-3 items-center opacity-70">
              <div className="avatar w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg">
                <Bot size={16} />
              </div>
              <div className="msg-bubble p-3 rounded-2xl text-sm bg-white/5 border border-white/10 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> 
                <span className="text-xs">Connecting to Gemini...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input 
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask a question about the election..."
          className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-gray-500"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-600 p-2.5 rounded-full transition-all shadow-lg active:scale-95"
          disabled={isLoading || !inputValue.trim()}
          aria-label="Send Message"
        >
          <Send size={20} />
        </button>
      </form>
    </section>
  );
});

Assistant.displayName = 'Assistant';
export default Assistant;
