import { useState, useCallback, useRef } from 'react';
import DOMPurify from 'dompurify';
import { auth } from '../config/firebase';

/**
 * Enterprise-grade hook for managing AI Assistant interactions.
 * Handles streaming, session management, and sanitization.
 */
export const useAssistant = (initialMessages = []) => {
  const [messages, setMessages] = useState(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId] = useState(() => `sess_${Math.random().toString(36).substring(7)}`);
  
  const abortControllerRef = useRef(null);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isLoading) return;

    // Reset state for new interaction
    setError(null);
    setIsLoading(true);
    
    // Add user message locally
    setMessages(prev => [...prev, { sender: 'user', text: text.trim() }]);

    try {
      // Abort any existing request
      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();

      const idToken = await auth.currentUser?.getIdToken();
      
      const response = await fetch("/api/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({ message: text, sessionId }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to connect to assistant");
      }

      // Initialize bot response placeholder
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
                console.warn("Parse error", e);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

    } catch (err) {
      if (err.name === 'AbortError') return;
      
      const errorMsg = err.message;
      setError(errorMsg);
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: errorMsg, 
        isError: true,
        retryText: text 
      }]);
    } finally {
      setIsLoading(false);
      setMessages(prev => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last) last.isStreaming = false;
        return next;
      });
    }
  }, [isLoading, sessionId]);

  const clearMessages = useCallback(() => {
    setMessages([{ sender: 'bot', text: "Conversation history cleared." }]);
  }, []);

  return { messages, isLoading, error, sendMessage, clearMessages, setMessages };
};
