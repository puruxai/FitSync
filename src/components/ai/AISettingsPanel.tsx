// FitSync Component: AISettingsPanel
// Configures active AI providers, models, memory modes, and secure credentials persistence

import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import type { AISettings } from '../../services/ai/aiProviderService';
import toast from 'react-hot-toast';

interface AISettingsPanelProps {
  settings: AISettings;
  onUpdate: (updates: Partial<Omit<AISettings, 'profile_id'>>) => Promise<any>;
  loading?: boolean;
}

export const AISettingsPanel: React.FC<AISettingsPanelProps> = ({
  settings,
  onUpdate,
  loading = false
}) => {
  const [provider, setProvider] = useState(settings.provider);
  const [model, setModel] = useState(settings.model);
  const [memoryEnabled, setMemoryEnabled] = useState(settings.memory_enabled);

  // Secure API key states (stored locally on client's localStorage)
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [openrouterKey, setOpenrouterKey] = useState('');
  const [ollamaEndpoint, setOllamaEndpoint] = useState('http://localhost:11434');

  useEffect(() => {
    setGeminiKey(localStorage.getItem('fs_gemini_api_key') || '');
    setOpenaiKey(localStorage.getItem('fs_openai_api_key') || '');
    setOpenrouterKey(localStorage.getItem('fs_openrouter_api_key') || '');
    setOllamaEndpoint(localStorage.getItem('fs_ollama_endpoint') || 'http://localhost:11434');
  }, []);

  const handleSaveKeys = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('fs_gemini_api_key', geminiKey);
    localStorage.setItem('fs_openai_api_key', openaiKey);
    localStorage.setItem('fs_openrouter_api_key', openrouterKey);
    localStorage.setItem('fs_ollama_endpoint', ollamaEndpoint);
    toast.success('API keys and local endpoints updated securely!');
  };

  const handleUpdateConfig = async () => {
    try {
      await onUpdate({
        provider,
        model,
        memory_enabled: memoryEnabled
      });
      toast.success('AI Configuration saved!');
    } catch {
      toast.error('Failed to update config.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left select-none">
      
      {/* Provider Selector */}
      <Card variant="glass" className="p-5 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl space-y-5 h-fit">
        <h3 className="text-sm font-black text-slate-855 dark:text-white">Active AI Engine</h3>
        
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pluggable Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as any)}
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/30 rounded-xl focus:outline-none dark:text-white"
            >
              <option value="gemini">Google Gemini (Recommended)</option>
              <option value="openai">OpenAI GPT</option>
              <option value="claude">Anthropic Claude</option>
              <option value="ollama">Ollama (Local LLM)</option>
              <option value="openrouter">OpenRouter Engine</option>
            </select>
          </div>

          <Input
            label="Model Identifier"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="e.g. gemini-1.5-flash"
          />

          <div className="flex items-center justify-between gap-4 py-1">
            <div className="min-w-0 flex-1">
              <label className="text-xs font-bold text-slate-855 dark:text-slate-200 block">
                Enable Context Memory
              </label>
              <span className="text-[9px] text-slate-400 font-semibold leading-relaxed block mt-0.5">
                Retain active conversation messages to help guide recommendations
              </span>
            </div>

            <button
              onClick={() => setMemoryEnabled(!memoryEnabled)}
              disabled={loading}
              className={`w-10 h-6 rounded-full p-1 transition-all cursor-pointer ${memoryEnabled ? 'bg-brand-500 flex justify-end' : 'bg-slate-200 dark:bg-slate-800 flex justify-start'}`}
            >
              <span className="w-4 h-4 bg-white rounded-full shadow" />
            </button>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleUpdateConfig} disabled={loading} isLoading={loading}>
              Save Configuration
            </Button>
          </div>
        </div>
      </Card>

      {/* Local API Keys Form */}
      <Card variant="glass" className="p-5 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl space-y-4 h-fit">
        <div>
          <h3 className="text-sm font-black text-slate-855 dark:text-white leading-tight">Secure Local API Keys</h3>
          <p className="text-[9px] text-slate-400 font-semibold mt-1">
            Your keys are stored only in your browser storage. They are never sent to any external server.
          </p>
        </div>

        <form onSubmit={handleSaveKeys} className="space-y-4">
          <Input
            label="Google Gemini API Key"
            type="password"
            placeholder="AIzaSy..."
            value={geminiKey}
            onChange={(e) => setGeminiKey(e.target.value)}
          />

          <Input
            label="OpenAI API Key"
            type="password"
            placeholder="sk-proj-..."
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
          />

          <Input
            label="OpenRouter API Key"
            type="password"
            placeholder="sk-or-v1-..."
            value={openrouterKey}
            onChange={(e) => setOpenrouterKey(e.target.value)}
          />

          <Input
            label="Ollama Local URL"
            placeholder="http://localhost:11434"
            value={ollamaEndpoint}
            onChange={(e) => setOllamaEndpoint(e.target.value)}
          />

          <div className="flex justify-end pt-2">
            <Button type="submit">
              Save Keys
            </Button>
          </div>
        </form>
      </Card>

    </div>
  );
};

export default AISettingsPanel;
