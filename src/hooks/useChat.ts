// FitSync Hook: useChat
// Connects UI input fields to the streaming responses of active AI Provider services

import { useState, useEffect, useCallback } from 'react';
import { AIProviderService, type AIConversation, type AIMessage } from '../services/ai/aiProviderService';

export const useChat = (userId?: string) => {
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConv, setActiveConv] = useState<AIConversation | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');

  const loadConversations = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const list = await AIProviderService.getConversations(userId);
      setConversations(list);
      if (list.length > 0 && !activeConv) {
        setActiveConv(list[0]);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [userId, activeConv]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const loadMessages = useCallback(async () => {
    if (!activeConv) return;
    try {
      setLoading(true);
      const list = await AIProviderService.getMessages(activeConv.id);
      setMessages(list);
    } catch {} finally {
      setLoading(false);
    }
  }, [activeConv]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const createNewThread = async (title: string) => {
    if (!userId) return;
    const thread = await AIProviderService.createConversation(userId, title);
    setConversations(prev => [thread, ...prev]);
    setActiveConv(thread);
    return thread;
  };

  const sendMessage = async (content: string) => {
    if (!userId || !activeConv || !content.trim()) return;

    // 1. Add user message
    const userMsg = await AIProviderService.addMessage(activeConv.id, 'user', content);
    setMessages(prev => [...prev, userMsg]);

    // 2. Fetch provider and start streaming
    try {
      const provider = await AIProviderService.getProvider(userId);
      const historyPayload = messages.map(m => ({ role: m.role, content: m.content }));

      setStreamingText('Thinking...');
      
      const response = await provider.streamResponse(content, historyPayload, (chunk) => {
        setStreamingText(chunk);
      });

      // 3. Save assistant message and reset streaming
      const assistantMsg = await AIProviderService.addMessage(activeConv.id, 'assistant', response);
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Failed to get streaming response:', err);
    } finally {
      setStreamingText('');
    }
  };

  const clearHistory = async () => {
    if (!activeConv) return;
    await AIProviderService.clearHistory(activeConv.id);
    setMessages([]);
  };

  const exportChatHistory = (): string => {
    return JSON.stringify(messages, null, 2);
  };

  return {
    conversations,
    activeConv,
    messages,
    loading,
    streamingText,
    setActiveConv,
    createNewThread,
    sendMessage,
    clearHistory,
    exportChatHistory
  };
};

export default useChat;
