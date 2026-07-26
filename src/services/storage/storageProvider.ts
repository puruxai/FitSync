// FitSync Storage Provider Contract Interface
// Defines methods for file uploads, downloads, deletions, and link signing

export interface UploadOptions {
  contentType?: string;
  upsert?: boolean;
}

export interface StorageProvider {
  name: string;
  uploadFile(bucket: string, path: string, file: File | Blob, options?: UploadOptions): Promise<string>;
  downloadFile(bucket: string, path: string): Promise<Blob>;
  deleteFile(bucket: string, path: string): Promise<void>;
  getPublicUrl(bucket: string, path: string): string;
  getSignedUrl(bucket: string, path: string, expiresInSeconds?: number): Promise<string>;
}
