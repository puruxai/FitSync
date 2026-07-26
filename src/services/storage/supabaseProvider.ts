// FitSync Supabase Storage Provider Concrete Class
// Connects to supabase.storage bucket APIs

import { supabase } from '../../lib/supabase';
import type { StorageProvider, UploadOptions } from './storageProvider';

export class SupabaseProvider implements StorageProvider {
  name = 'supabase';

  async uploadFile(bucket: string, path: string, file: File | Blob, options?: UploadOptions): Promise<string> {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType: options?.contentType,
        upsert: options?.upsert ?? true
      });

    if (error) throw error;
    return this.getPublicUrl(bucket, path);
  }

  async downloadFile(bucket: string, path: string): Promise<Blob> {
    const { data, error } = await supabase.storage.from(bucket).download(path);
    if (error) throw error;
    return data;
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
  }

  getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async getSignedUrl(bucket: string, path: string, expiresInSeconds = 3600): Promise<string> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresInSeconds);

    if (error) throw error;
    return data.signedUrl;
  }
}
export default SupabaseProvider;
