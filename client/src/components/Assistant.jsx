import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, User, Send, Loader2, Trash2, RefreshCcw } from 'lucide-react';
import DOMPurify from 'dompurify';
import { auth } from '../config/firebase';

const Assistant = React.memo(({ user }) => {
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: `Namaste ${user?.displayName?.split(' ')[0] || ''}! I'm your AI Election Guide. How can I help you today?` 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  const [sessionId] = useState(() => `sess_${Math.random().toString(36).substring(7)}`);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = useCallback(async (e) => {
    if (e) e.preventDefault();
    const message = inputValue.trim();
    if (!message || isLoading) return;

    setMessages(prev => [...prev, { sender: 'user', text: message }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const idToken = await auth.currentUser.getIdToken();
      const response = await fetch("/api/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({ message, sessionId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to connect to assistant.");
      }
      
      setMessages(prev => [...prev, { sender: 'bot', text: '', isStreaming: true }]);
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;

              try {
                const parsed = JSON.parse(data);
                if (parsed.chunk) {
                  accumulatedText += parsed.chunk;
                  setMessages(prev => {
                    const next = [...prev];
                    const last = next[next.length - 1];
                    if (last && last.sender === 'bot') {
                      last.text = DOMPurify.sanitize(accumulatedText);
                    }
                    return next;
                  });
                }
              } catch (e) {
                console.warn("Stream parse error", e);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
        setMessages(prev => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last) last.isStreaming = false;
          return next;
        });
      }

    } catch (error) {
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: error.message, 
        isError: true,
        canRetry: true,
        retryText: message
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, sessionId]);

  const clearChat = () => {
    setMessages([{ 
      sender: 'bot', 
      text: "Conversation cleared. How else can I assist you?" 
    }]);
  };

  return (
    <section className="glass-card assistant-container" aria-label="AI Assistant">
      <div className="assistant-header flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">Civic AI Assistant</h2>
          <p className="text-xs text-gray-400">Authenticated as {user.email}</p>
        </div>
        <button onClick={clearChat} className="btn-secondary p-2 rounded-full" title="Clear Chat">
          <Trash2 size={18} />
        </button>
      </div>
      
      <div className="chat-box flex-1 overflow-y-auto pr-2" style={{ maxHeight: '450px' }}>
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
              <div className={`avatar w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'bot' ? 'bg-indigo-600' : 'bg-gray-700'}`}>
                {msg.sender === 'bot' ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className="msg-wrapper">
                <div 
                  className={`msg-bubble p-3 rounded-2xl text-sm ${
                    msg.sender === 'user' ? 'bg-indigo-500 rounded-tr-none' : 'bg-white/5 border border-white/10 rounded-tl-none'
                  } ${msg.isError ? 'border-red-500/50 text-red-200 bg-red-500/10' : ''}`}
                  dangerouslySetInnerHTML={{ __html: msg.text }}
                />
                {msg.canRetry && (
                  <button 
                    onClick={() => { setInputValue(msg.retryText); setMessages(prev => prev.slice(0, -1)); }}
                    className="flex items-center gap-1 text-xs text-indigo-400 mt-2 hover:text-indigo-300 transition-colors"
                  >
                    <RefreshCcw size={12} /> Retry request
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && !messages[messages.length-1].isStreaming && (
          <div className="chat-msg mb-4 flex justify-start">
            <div className="flex gap-3 items-center opacity-70">
              <div className="avatar w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="msg-bubble p-3 rounded-2xl text-sm bg-white/5 animate-pulse flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Thinking...
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
        <input 
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-all"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 p-2 rounded-full transition-all"
          disabled={isLoading || !inputValue.trim()}
        >
          <Send size={20} />
        </button>
      </form>
    </section>
  );
});

Assistant.displayName = 'Assistant';
export default Assistant;
