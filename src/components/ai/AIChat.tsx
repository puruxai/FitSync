// FitSync Component: AIChat
// Implements streaming AI dialogue interface with typing indicators, thread selectors, and history exports

import React, { useState, useRef, useEffect } from 'react';
import Button from '../ui/Button';
import type { AIConversation, AIMessage } from '../../services/ai/aiProviderService';
import toast from 'react-hot-toast';

interface AIChatProps {
  conversations: AIConversation[];
  activeConv: AIConversation | null;
  messages: AIMessage[];
  streamingText: string;
  onSelectConv: (conv: AIConversation) => void;
  onSend: (text: string) => Promise<void>;
  onClear: () => Promise<void>;
  onExport: () => string;
  onCreateThread: (title: string) => Promise<any>;
}

export const AIChat: React.FC<AIChatProps> = ({
  conversations,
  activeConv,
  messages,
  streamingText,
  onSelectConv,
  onSend,
  onClear,
  onExport,
  onCreateThread
}) => {
  const [inputText, setInputText] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;
    try {
      setSending(true);
      const text = inputText;
      setInputText('');
      await onSend(text);
    } catch {
      toast.error('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await onCreateThread(newTitle);
      setNewTitle('');
      toast.success('New coaching session started!');
    } catch {
      toast.error('Failed to create session.');
    }
  };

  const handleExport = () => {
    const raw = onExport();
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitsync_chat_history_${activeConv?.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Chat history downloaded!');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[72vh] border border-slate-200/50 dark:border-slate-800/40 rounded-3xl overflow-hidden bg-white/30 dark:bg-slate-900/20 backdrop-blur-md">
      
      {/* Sidebar - Threads */}
      <div className="md:col-span-1 border-r border-slate-100 dark:border-slate-800/40 p-4 flex flex-col justify-between bg-slate-50/50 dark:bg-slate-900/40">
        <div className="space-y-4 text-left">
          <div className="flex justify-between items-center select-none">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Sessions</h3>
          </div>

          <form onSubmit={handleCreateThread} className="flex gap-2">
            <input
              placeholder="Start new topic..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1 px-3 py-1.5 text-[10px] font-semibold bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/30 rounded-xl focus:outline-none dark:text-white"
            />
            <button type="submit" className="p-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl flex items-center justify-center cursor-pointer">
              <span className="material-symbols-outlined text-sm font-black">add</span>
            </button>
          </form>

          <div className="space-y-1.5 max-h-[48vh] overflow-y-auto pr-1">
            {conversations.map(c => (
              <button
                key={c.id}
                onClick={() => onSelectConv(c)}
                className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-[10px] font-bold block truncate transition-all cursor-pointer ${
                  activeConv?.id === c.id
                    ? 'bg-brand-500/10 text-brand-650 dark:text-brand-400 border border-brand-500/20'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/30 border border-transparent'
                }`}
              >
                {c.title}
              </button>
            ))}
          </div>
        </div>

        {activeConv && (
          <div className="flex gap-2 select-none border-t border-slate-100 dark:border-slate-800/30 pt-3">
            <Button size="sm" variant="outline" onClick={handleExport} className="flex-1" leftIcon="download">
              Export
            </Button>
            <Button size="sm" variant="outline" onClick={onClear} className="text-red-500 border-red-500/10 hover:bg-red-500/10" leftIcon="delete">
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Main Chat log */}
      <div className="md:col-span-3 flex flex-col justify-between h-full bg-white/10 dark:bg-slate-900/10">
        
        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(m => (
            <div
              key={m.id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-3 rounded-[1.4rem] text-xs font-semibold leading-relaxed text-left shadow-sm ${
                  m.role === 'user'
                    ? 'bg-brand-500 text-white rounded-tr-none'
                    : 'bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-800/20'
                }`}
              >
                {/* Simplified markdown formatter helper */}
                <div className="whitespace-pre-line space-y-2">
                  {m.content}
                </div>
              </div>
            </div>
          ))}

          {/* Streaming builder bubble */}
          {streamingText && (
            <div className="flex justify-start">
              <div className="max-w-[75%] px-4 py-3 rounded-[1.4rem] rounded-tl-none text-xs font-semibold leading-relaxed text-left bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800/20 shadow-sm">
                <div className="whitespace-pre-line">{streamingText}</div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input box */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-100 dark:border-slate-800/40 flex gap-3 bg-white/20 dark:bg-slate-900/40">
          <input
            placeholder="Ask AI Coach a question, e.g., 'Correct my daily steps goal to 12000'..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={sending}
            className="flex-1 px-4 py-3 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/30 rounded-2xl focus:outline-none dark:text-white focus:ring-2 focus:ring-brand-500"
          />
          <Button type="submit" disabled={sending} isLoading={sending} leftIcon="send">
            Ask
          </Button>
        </form>
      </div>

    </div>
  );
};

export default AIChat;
