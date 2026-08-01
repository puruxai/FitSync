// FitSync Component: AIChat
// Implements streaming AI dialogue interface with typing indicators, thread selectors, history exports, quick actions, and HTML5 Web Speech recognition

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
  const [isListening, setIsListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const QUICK_ACTIONS = [
    { label: '🏋️ HIIT Routine', text: 'Generate a 20-min HIIT Routine for fat burning.' },
    { label: '🥗 High-Protein Diet', text: 'Suggest a high-protein diet plan targeting 1800 calories.' },
    { label: '📈 Progress Prediction', text: 'Predict my fitness progress and BMI trends for next month.' },
    { label: '💧 Hydration Check', text: 'Give me hydration tips for endurance runs.' }
  ];

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

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice recognition is not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        toast.success('Listening... Speak into your mic.');
      };

      recognition.onerror = () => {
        toast.error('Could not capture audio.');
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const speechToText = event.results[0][0].transcript;
        setInputText(prev => (prev ? prev + ' ' + speechToText : speechToText));
      };

      recognition.start();
    } catch (e: any) {
      toast.error('Speech recognition failed to initialize.');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[72vh] border border-slate-900 rounded-3xl overflow-hidden bg-[#121212] backdrop-blur-md">
      
      {/* Sidebar - Threads */}
      <div className="md:col-span-1 border-r border-slate-900 p-4 flex flex-col justify-between bg-slate-950">
        <div className="space-y-4 text-left">
          <div className="flex justify-between items-center select-none">
            <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">Sessions</h3>
          </div>

          <form onSubmit={handleCreateThread} className="flex gap-2">
            <input
              placeholder="Start new topic..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1 px-3 py-1.5 text-[10px] font-semibold bg-slate-900 border border-slate-800 rounded-xl focus:outline-none text-white"
            />
            <button type="submit" className="p-1.5 bg-brand-500 hover:bg-brand-650 text-slate-950 rounded-xl flex items-center justify-center cursor-pointer">
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
                    ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                    : 'text-slate-400 hover:bg-slate-900 border border-transparent'
                }`}
              >
                {c.title}
              </button>
            ))}
          </div>
        </div>

        {activeConv && (
          <div className="flex gap-2 select-none border-t border-slate-900 pt-3">
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
      <div className="md:col-span-3 flex flex-col justify-between h-full bg-slate-900/30">
        
        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !streamingText && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 select-none opacity-60">
              <span className="material-symbols-outlined text-5xl text-brand-400">smart_toy</span>
              <p className="text-xs text-slate-400 font-semibold max-w-sm">
                Welcome to your FitSync Coaching Session! Pick a quick action below or type a query to begin.
              </p>
            </div>
          )}

          {messages.map(m => (
            <div
              key={m.id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-3 rounded-[1.4rem] text-xs font-semibold leading-relaxed text-left shadow-sm ${
                  m.role === 'user'
                    ? 'bg-brand-500 text-slate-950 rounded-tr-none'
                    : 'bg-slate-950 text-slate-200 rounded-tl-none border border-slate-900'
                }`}
              >
                <div className="whitespace-pre-line space-y-2">
                  {m.content}
                </div>
              </div>
            </div>
          ))}

          {/* Streaming builder bubble */}
          {streamingText && (
            <div className="flex justify-start">
              <div className="max-w-[75%] px-4 py-3 rounded-[1.4rem] rounded-tl-none text-xs font-semibold leading-relaxed text-left bg-slate-950 text-slate-200 border border-slate-900 shadow-sm">
                <div className="whitespace-pre-line">{streamingText}</div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-2.5 flex flex-wrap gap-2 border-t border-slate-900 bg-slate-950/30 overflow-x-auto">
          {QUICK_ACTIONS.map((qa, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setInputText(qa.text)}
              className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-slate-950 border border-brand-500/20 text-brand-400 rounded-full hover:bg-brand-500 hover:text-slate-950 transition-all cursor-pointer whitespace-nowrap"
            >
              {qa.label}
            </button>
          ))}
        </div>

        {/* Input box */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-900 flex gap-3 bg-slate-950">
          <input
            placeholder="Ask AI Coach a question..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={sending}
            className="flex-1 px-4 py-3 text-xs font-semibold bg-slate-900 border border-slate-800 rounded-2xl focus:outline-none text-white focus:ring-1 focus:ring-brand-500"
          />
          <button
            type="button"
            onClick={startListening}
            className={`p-2.5 rounded-2xl flex items-center justify-center transition-all border cursor-pointer ${
              isListening
                ? 'bg-red-500/20 border-red-500/50 text-red-500 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Speech-to-Text Input"
          >
            <span className="material-symbols-outlined text-sm">mic</span>
          </button>
          <Button type="submit" disabled={sending} isLoading={sending} leftIcon="send">
            Ask
          </Button>
        </form>
      </div>

    </div>
  );
};

export default AIChat;
