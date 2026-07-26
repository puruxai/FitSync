// FitSync File Upload Validator & History Service
// Handles upload sizing checks, formats permissions tags, and tracks uploads progress status logs

import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { getFromMockDb, saveToMockDb } from '../mockDb';

export interface UploadLog {
  id: string;
  user_id: string;
  filename: string;
  file_size: number;
  status: 'success' | 'failed' | 'cancelled';
  error_message?: string;
  created_at: string;
}

export const UploadService = {
  /**
   * Validate file criteria: size limits, mime types
   */
  validateFile(file: File, maxSizeMB = 10, allowedTypes = ['image/', 'video/', 'application/pdf']): { valid: boolean; error?: string } {
    const sizeBytes = file.size;
    const maxBytes = maxSizeMB * 1024 * 1024;

    if (sizeBytes > maxBytes) {
      return { valid: false, error: `File size exceeds limits. Maximum: ${maxSizeMB}MB.` };
    }

    const typeMatch = allowedTypes.some(t => file.type.startsWith(t) || file.type === t);
    if (!typeMatch) {
      return { valid: false, error: 'Invalid file format. Upload rejected.' };
    }

    return { valid: true };
  },

  /**
   * Log upload transaction status
   */
  async logUpload(userId: string, filename: string, size: number, status: UploadLog['status'], error?: string): Promise<void> {
    const payload = {
      user_id: userId,
      filename,
      file_size: size,
      status,
      error_message: error || ''
    };

    if (isSupabaseConfigured) {
      await supabase.from('upload_history').insert(payload);
    } else {
      const logs = getFromMockDb<UploadLog>('upload_history');
      logs.push({
        id: 'log-' + Math.random().toString(36).substr(2, 9),
        ...payload,
        created_at: new Date().toISOString()
      });
      saveToMockDb('upload_history', logs);
    }
  }
};
export default UploadService;
