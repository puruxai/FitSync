// FitSync Logging Service
// Implements structured level logging (Trace, Debug, Info, Warning, Error, Critical)

import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { getFromMockDb, saveToMockDb } from '../mockDb';

export type LogLevel = 'trace' | 'debug' | 'info' | 'warning' | 'error' | 'critical';

export interface SystemLog {
  id?: string;
  level: LogLevel;
  component: string;
  message: string;
  metadata?: any;
  created_at?: string;
}

export const LoggingService = {
  /**
   * Log structured message
   */
  async log(level: LogLevel, component: string, message: string, metadata: any = {}): Promise<void> {
    const payload = {
      level,
      component,
      message,
      metadata: JSON.stringify(metadata)
    };

    console.log(`[${level.toUpperCase()}] [${component}] ${message}`, metadata);

    try {
      if (isSupabaseConfigured) {
        await supabase.from('system_logs').insert(payload);
      } else {
        const logs = getFromMockDb<any>('system_logs');
        logs.push({
          id: 'log-' + Math.random().toString(36).substr(2, 9),
          ...payload,
          created_at: new Date().toISOString()
        });
        saveToMockDb('system_logs', logs);
      }
    } catch {
      // Avoid crash on log sync failures
    }
  },

  trace(component: string, message: string, metadata?: any) { return this.log('trace', component, message, metadata); },
  debug(component: string, message: string, metadata?: any) { return this.log('debug', component, message, metadata); },
  info(component: string, message: string, metadata?: any) { return this.log('info', component, message, metadata); },
  warn(component: string, message: string, metadata?: any) { return this.log('warning', component, message, metadata); },
  error(component: string, message: string, metadata?: any) { return this.log('error', component, message, metadata); },
  critical(component: string, message: string, metadata?: any) { return this.log('critical', component, message, metadata); }
};
export default LoggingService;
