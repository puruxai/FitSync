// FitSync Central Storage Service Factory
// Switches storage providers based on Supabase configurations and exports unified file operations

import { isSupabaseConfigured } from '../../lib/supabase';
import type { StorageProvider, UploadOptions } from './storageProvider';
import { SupabaseProvider } from './supabaseProvider';
import { LocalProvider } from './localProvider';

const activeProvider: StorageProvider = isSupabaseConfigured
  ? new SupabaseProvider()
  : new LocalProvider();

export const StorageService = {
  getProviderName(): string {
    return activeProvider.name;
  },

  /**
   * Upload file to active provider
   */
  async upload(bucket: string, path: string, file: File | Blob, options?: UploadOptions): Promise<string> {
    return activeProvider.uploadFile(bucket, path, file, options);
  },

  /**
   * Download file
   */
  async download(bucket: string, path: string): Promise<Blob> {
    return activeProvider.downloadFile(bucket, path);
  },

  /**
   * Delete file
   */
  async delete(bucket: string, path: string): Promise<void> {
    return activeProvider.deleteFile(bucket, path);
  },

  /**
   * Get public URL link
   */
  getPublicUrl(bucket: string, path: string): string {
    return activeProvider.getPublicUrl(bucket, path);
  },

  /**
   * Get temporary signed link
   */
  async getSignedUrl(bucket: string, path: string, expiresInSeconds = 3600): Promise<string> {
    return activeProvider.getSignedUrl(bucket, path, expiresInSeconds);
  }
};
export default StorageService;
