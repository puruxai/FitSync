import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AIProviderService } from '../../services/ai/aiProviderService';
import type { AIMessage } from '../../services/ai/aiProviderService';
import Button from '../ui/Button';
import Input from '../ui/Input';
import toast from 'react-hot-toast';

export const AIAssistant: React.FC = () => {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const profileId = profile?.id || 'guest';

  // Load conversation and messages
  useEffect(() => {
    if (isOpen) {
      const initChat = async () => {
        try {
          const convs = await AIProviderService.getConversations(profileId);
          let activeId = conversationId;
          if (!activeId) {
            if (convs.length > 0) {
              activeId = convs[0].id;
            } else {
              const newConv = await AIProviderService.createConversation(profileId, 'AI Coaching Session');
              activeId = newConv.id;
            }
            setConversationId(activeId);
          }
          if (activeId) {
            const list = await AIProviderService.getMessages(activeId);
            setMessages(list);
          }
        } catch (err) {
          console.error('Failed to init AI chat:', err);
        }
      };
      initChat();
    }
  }, [isOpen, profileId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !conversationId) return;
    setInputValue('');
    setIsTyping(true);

    try {
      // 1. Add User Message
      const userMsg = await AIProviderService.addMessage(conversationId, 'user', text);
      setMessages((prev) => [...prev, userMsg]);

      // 2. Fetch AI Provider
      const provider = await AIProviderService.getProvider(profileId);

      // 3. Prepare Payload
      const historyPayload = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      // Create a temporary message for streaming simulation
      const tempAiId = 'temp-' + Math.random().toString(36).substr(2, 9);
      let accumulatedText = '';
      
      setMessages(prev => [...prev, {
        id: tempAiId,
        conversation_id: conversationId,
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString()
      }]);

      await provider.streamResponse(text, historyPayload, (chunk) => {
        accumulatedText += chunk;
        setMessages(prev => 
          prev.map(m => m.id === tempAiId ? { ...m, content: accumulatedText } : m)
        );
      });

      // 4. Save Final AI Message to Database & Replace Temp
      const finalMsg = await AIProviderService.addMessage(conversationId, 'assistant', accumulatedText);
      setMessages(prev => prev.map(m => m.id === tempAiId ? finalMsg : m));

    } catch (err) {
      console.error('Failed to get AI response:', err);
      // Fallback response inside try-catch
      const errorMsg: AIMessage = {
        id: 'msg-err-' + Date.now(),
        conversation_id: conversationId,
        role: 'assistant',
        content: 'I encountered a connection hiccup, but keep pushing forward with your routine!',
        created_at: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleMicClick = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice input is not supported in this browser.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        toast.success('Listening...');
      };

      recognition.onerror = () => {
        toast.error('Voice input failed.');
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onresult = (event: any) => {
        const speechToText = event.results[0][0].transcript;
        setInputValue(prev => (prev ? prev + ' ' + speechToText : speechToText));
      };

      recognition.start();
    } catch (e) {
      setIsRecording(false);
    }
  };

  const handleQuickAction = (phrase: string) => {
    handleSendMessage(phrase);
  };

  // Basic Markdown Formatter Helper
  const renderMessageContent = (content: string) => {
    return content.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      
      // Header formatting
      if (trimmed.startsWith('### ')) {
        return <h5 key={idx} className="text-sm font-black text-brand-400 mt-2 mb-1">{trimmed.replace('### ', '')}</h5>;
      }
      if (trimmed.startsWith('## ')) {
        return <h4 key={idx} className="text-base font-black text-brand-400 mt-2 mb-1">{trimmed.replace('## ', '')}</h4>;
      }
      
      // List formatting
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        return <li key={idx} className="ml-4 list-disc text-xs text-slate-200 mt-0.5">{trimmed.substring(2)}</li>;
      }

      // Ordered list formatting
      const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
        return <li key={idx} className="ml-4 list-decimal text-xs text-slate-200 mt-0.5">{numMatch[2]}</li>;
      }

      // Blockquotes / Tips
      if (trimmed.startsWith('> ')) {
        return (
          <blockquote key={idx} className="border-l-2 border-brand-500 pl-2 py-1 my-1 bg-slate-900/40 text-[11px] italic text-slate-300">
            {trimmed.replace('> ', '')}
          </blockquote>
        );
      }

      // Empty line
      if (trimmed === '') return <div key={idx} className="h-1" />;

      return <p key={idx} className="text-xs text-slate-200 mb-1 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 transition-all duration-300">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 border border-brand-500/30 text-brand-400 shadow-[0_0_15px_rgba(57,255,20,0.25)] transition-all duration-300 hover:scale-110 hover:border-brand-500 hover:shadow-[0_0_20px_rgba(57,255,20,0.5)] cursor-pointer"
        >
          <span className="material-symbols-outlined text-2xl font-bold animate-pulse">smart_toy</span>
        </button>
      )}

      {/* Expanded AI Chat Assistant Panel */}
      {isOpen && (
        <div className="w-96 h-[480px] flex flex-col rounded-2xl bg-slate-950/95 border border-brand-500/25 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all duration-300 overflow-hidden">
          {/* Header Panel */}
          <div className="flex items-center justify-between p-4 bg-slate-900/80 border-b border-slate-900">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-brand-400">smart_toy</span>
              <div>
                <h4 className="text-xs font-bold text-white tracking-widest uppercase">FitSync AI Coach</h4>
                <p className="text-[10px] text-slate-400">Active & Ready</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Quick recommendations menu */}
          <div className="flex gap-2 p-2 bg-slate-900/40 border-b border-slate-900 overflow-x-auto scrollbar-none">
            <button
              onClick={() => handleQuickAction('Give me a bodyweight circuit plan')}
              className="flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-800 hover:bg-brand-500 hover:text-slate-950 transition-colors border border-slate-700 cursor-pointer"
            >
              🏋️ Circuit Plan
            </button>
            <button
              onClick={() => handleQuickAction('Suggest a high protein breakfast menu')}
              className="flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-800 hover:bg-brand-500 hover:text-slate-950 transition-colors border border-slate-700 cursor-pointer"
            >
              🥗 Protein Meal
            </button>
            <button
              onClick={() => handleQuickAction('What precautions should I take for squats?')}
              className="flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-800 hover:bg-brand-500 hover:text-slate-950 transition-colors border border-slate-700 cursor-pointer"
            >
              ⚠️ Safety Check
            </button>
            <button
              onClick={() => handleQuickAction('Give me gym motivation phrase')}
              className="flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-800 hover:bg-brand-500 hover:text-slate-950 transition-colors border border-slate-700 cursor-pointer"
            >
              🔥 Motivation
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {m.role !== 'user' && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-950/40 border border-brand-500/20 text-brand-400">
                    <span className="material-symbols-outlined text-sm">smart_toy</span>
                  </div>
                )}
                <div
                  className={`p-3 rounded-xl border text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-brand-500 text-slate-950 font-semibold border-brand-500 rounded-tr-none'
                      : 'bg-slate-900/60 text-white border-slate-850 rounded-tl-none'
                  }`}
                >
                  {m.role === 'user' ? m.content : renderMessageContent(m.content)}
                </div>
              </div>
            ))}
            
            {/* Loading typing state */}
            {isTyping && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-950/40 border border-brand-500/20 text-brand-400">
                  <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                </div>
                <div className="bg-slate-900/60 text-white border-slate-850 p-3 rounded-xl rounded-tl-none border">
                  <div className="flex items-center gap-1.5 py-1">
                    <span className="h-1.5 w-1.5 bg-brand-400 rounded-full animate-bounce [animation-delay:0s]"></span>
                    <span className="h-1.5 w-1.5 bg-brand-400 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                    <span className="h-1.5 w-1.5 bg-brand-400 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form input bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="p-3 bg-slate-900/60 border-t border-slate-900 flex gap-2 items-center"
          >
            <Input
              type="text"
              placeholder="Ask coach anything..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-grow !mb-0 !bg-slate-950 border border-slate-800"
            />
            <button
              type="button"
              onClick={handleMicClick}
              className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-all cursor-pointer ${
                isRecording
                  ? 'bg-red-600 text-white border-red-500 animate-pulse'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-brand-400'
              }`}
            >
              <span className="material-symbols-outlined text-lg">
                {isRecording ? 'mic_active' : 'mic'}
              </span>
            </button>
            <Button
              type="submit"
              className="!h-10 !w-10 !p-0 !min-h-0 flex items-center justify-center !bg-brand-400 hover:!bg-brand-500 !text-slate-950 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg font-black">send</span>
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};
export default AIAssistant;
