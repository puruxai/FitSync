// FitSync Local/Development Storage Provider Fallback
// Simulates uploads by saving data in IndexedDB and returning persistent Base64 Data URLs

import type { StorageProvider, UploadOptions } from './storageProvider';

export class LocalProvider implements StorageProvider {
  name = 'local';

  private getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB is not supported in this environment.'));
        return;
      }
      const request = indexedDB.open('FitSyncStorageDB', 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files');
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async uploadFile(_bucket: string, path: string, file: File | Blob, _options?: UploadOptions): Promise<string> {
    try {
      const db = await this.getDB();
      
      // Save original blob inside IndexedDB for physical download simulations
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('files', 'readwrite');
        const store = transaction.objectStore('files');
        const req = store.put(file, path);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('IndexedDB not available, falling back to memory mapping.', e);
    }

    // Convert file to Base64 data URL so it remains completely persistent inside mockDb storage
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => reject(new Error('Failed to read file as data URL'));
      reader.readAsDataURL(file);
    });
  }

  async downloadFile(_bucket: string, path: string): Promise<Blob> {
    const db = await this.getDB();
    return new Promise<Blob>((resolve, reject) => {
      const transaction = db.transaction('files', 'readonly');
      const store = transaction.objectStore('files');
      const req = store.get(path);
      req.onsuccess = () => {
        if (req.result) {
          resolve(req.result);
        } else {
          reject(new Error('File not found in local IndexedDB: ' + path));
        }
      };
      req.onerror = () => reject(req.error);
    });
  }

  async deleteFile(_bucket: string, path: string): Promise<void> {
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('files', 'readwrite');
        const store = transaction.objectStore('files');
        const req = store.delete(path);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('IndexedDB write/delete error:', e);
    }
  }

  getPublicUrl(_bucket: string, path: string): string {
    if (path.startsWith('data:')) {
      return path;
    }
    // Return standard fallback
    return `https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=80`;
  }

  async getSignedUrl(bucket: string, path: string, _expiresInSeconds = 3600): Promise<string> {
    return this.getPublicUrl(bucket, path);
  }
}
export default LocalProvider;
