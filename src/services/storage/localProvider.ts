// FitSync Local/Development Storage Provider Fallback
// Simulates uploads by creating Blob URLs, enabling fully functional offline testing

import type { StorageProvider, UploadOptions } from './storageProvider';

export class LocalProvider implements StorageProvider {
  name = 'local';
  private filesMap = new Map<string, Blob>();

  async uploadFile(_bucket: string, path: string, file: File | Blob, _options?: UploadOptions): Promise<string> {
    this.filesMap.set(path, file);
    return this.getPublicUrl(_bucket, path);
  }

  async downloadFile(_bucket: string, path: string): Promise<Blob> {
    const file = this.filesMap.get(path);
    if (!file) throw new Error('File not found in local mock cache: ' + path);
    return file;
  }

  async deleteFile(_bucket: string, path: string): Promise<void> {
    this.filesMap.delete(path);
  }

  getPublicUrl(_bucket: string, path: string): string {
    const file = this.filesMap.get(path);
    if (file) {
      return URL.createObjectURL(file);
    }
    // Return standard dummy fallback URL
    return `https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=80`;
  }

  async getSignedUrl(bucket: string, path: string, _expiresInSeconds = 3600): Promise<string> {
    return this.getPublicUrl(bucket, path);
  }
}
export default LocalProvider;
