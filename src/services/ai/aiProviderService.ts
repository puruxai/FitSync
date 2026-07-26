// FitSync AI Provider Factory Service
// Instantiates active providers based on configuration and handles Supabase/Local storage persistence

import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { getFromMockDb, saveToMockDb } from '../mockDb';
import type { AIProvider } from './provider';
import {
  GeminiProvider,
  OpenAIProvider,
  ClaudeProvider,
  OllamaProvider,
  OpenRouterProvider
} from './providers';

export interface AISettings {
  profile_id: string;
  provider: 'openai' | 'gemini' | 'claude' | 'ollama' | 'openrouter';
  model: string;
  memory_enabled: boolean;
}

export interface AIConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export const AIProviderService = {
  /**
   * Get settings
   */
  async getSettings(profileId: string): Promise<AISettings> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('ai_settings')
        .select('*')
        .eq('profile_id', profileId)
        .maybeSingle();
      if (error) throw error;
      if (data) return data as unknown as AISettings;
      return this.seedDefaultSettings(profileId);
    } else {
      const list = getFromMockDb<AISettings>('ai_settings');
      const found = list.find(s => s.profile_id === profileId);
      if (found) return found;
      return this.seedDefaultSettings(profileId);
    }
  },

  /**
   * Update settings
   */
  async updateSettings(profileId: string, updates: Partial<Omit<AISettings, 'profile_id'>>): Promise<AISettings> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('ai_settings')
        .update(updates)
        .eq('profile_id', profileId)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as AISettings;
    } else {
      const list = getFromMockDb<AISettings>('ai_settings');
      const idx = list.findIndex(s => s.profile_id === profileId);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updates };
        saveToMockDb('ai_settings', list);
        return list[idx];
      }
      throw new Error('Settings not found');
    }
  },

  /**
   * Seed defaults
   */
  async seedDefaultSettings(profileId: string): Promise<AISettings> {
    const defaults: AISettings = {
      profile_id: profileId,
      provider: 'gemini',
      model: 'gemini-1.5-flash',
      memory_enabled: true
    };
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('ai_settings')
        .insert(defaults)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as AISettings;
    } else {
      const list = getFromMockDb<AISettings>('ai_settings');
      list.push(defaults);
      saveToMockDb('ai_settings', list);
      return defaults;
    }
  },

  /**
   * Instantiate provider
   */
  async getProvider(profileId: string): Promise<AIProvider> {
    const settings = await this.getSettings(profileId);
    switch (settings.provider) {
      case 'openai': return new OpenAIProvider();
      case 'claude': return new ClaudeProvider();
      case 'ollama': return new OllamaProvider();
      case 'openrouter': return new OpenRouterProvider();
      default: return new GeminiProvider();
    }
  },

  /**
   * Get threads
   */
  async getConversations(userId: string): Promise<AIConversation[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as unknown as AIConversation[]) || [];
    } else {
      const list = getFromMockDb<AIConversation>('ai_conversations');
      const filtered = list.filter(c => c.user_id === userId);
      if (filtered.length === 0) {
        const defaultConv = {
          id: 'conv-default',
          user_id: userId,
          title: 'AI Coaching Session',
          created_at: new Date().toISOString()
        };
        list.push(defaultConv);
        saveToMockDb('ai_conversations', list);
        return [defaultConv];
      }
      return filtered;
    }
  },

  /**
   * Create conversation
   */
  async createConversation(userId: string, title: string): Promise<AIConversation> {
    const payload = {
      user_id: userId,
      title
    };
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('ai_conversations')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as AIConversation;
    } else {
      const list = getFromMockDb<AIConversation>('ai_conversations');
      const newConv = {
        id: 'conv-' + Math.random().toString(36).substr(2, 9),
        ...payload,
        created_at: new Date().toISOString()
      };
      list.push(newConv);
      saveToMockDb('ai_conversations', list);
      return newConv;
    }
  },

  /**
   * Get messages
   */
  async getMessages(conversationId: string): Promise<AIMessage[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data as unknown as AIMessage[]) || [];
    } else {
      const list = getFromMockDb<AIMessage>('ai_messages');
      const filtered = list.filter(m => m.conversation_id === conversationId);
      if (filtered.length === 0) {
        const greet: AIMessage = {
          id: 'msg-greet',
          conversation_id: conversationId,
          role: 'assistant',
          content: 'Hello! I am your AI Fitness Coach. Ask me how to generate workout circuits, macro meal plans, or evaluate BMI.',
          created_at: new Date().toISOString()
        };
        list.push(greet);
        saveToMockDb('ai_messages', list);
        return [greet];
      }
      return filtered;
    }
  },

  /**
   * Add message
   */
  async addMessage(conversationId: string, role: AIMessage['role'], content: string): Promise<AIMessage> {
    const payload = {
      conversation_id: conversationId,
      role,
      content
    };
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('ai_messages')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as AIMessage;
    } else {
      const list = getFromMockDb<AIMessage>('ai_messages');
      const newMsg = {
        id: 'msg-' + Math.random().toString(36).substr(2, 9),
        ...payload,
        created_at: new Date().toISOString()
      };
      list.push(newMsg);
      saveToMockDb('ai_messages', list);
      return newMsg;
    }
  },

  /**
   * Clear history
   */
  async clearHistory(conversationId: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase
        .from('ai_messages')
        .delete()
        .eq('conversation_id', conversationId);
    } else {
      const list = getFromMockDb<AIMessage>('ai_messages');
      const filtered = list.filter(m => m.conversation_id !== conversationId);
      saveToMockDb('ai_messages', filtered);
    }
  }
};
export default AIProviderService;
