// FitSync Hook: useUpload
// Handles file upload progressions, validators, drag-drop events, and paste upload actions

import { useState, useCallback } from 'react';
import { StorageService } from '../services/storage/storageService';
import { MediaService } from '../services/storage/mediaService';
import { UploadService } from '../services/storage/uploadService';
import toast from 'react-hot-toast';

export const useUpload = (userId?: string) => {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploading, setUploading] = useState(false);

  const uploadFile = useCallback(async (
    file: File,
    category: string,
    folderId?: string
  ) => {
    if (!userId) return;
    try {
      setUploading(true);
      setUploadProgress(10); // Simulated progress start

      // Validate file
      const validation = UploadService.validateFile(file);
      if (!validation.valid) {
        toast.error(validation.error || 'Validation failed');
        await UploadService.logUpload(userId, file.name, file.size, 'failed', validation.error);
        return;
      }

      setUploadProgress(40);

      // Unique file path
      const uniqueName = `${Date.now()}-${file.name}`;
      const path = `${category}/${userId}/${uniqueName}`;

      // Upload to storage
      const publicUrl = await StorageService.upload('media', path, file, {
        contentType: file.type
      });

      setUploadProgress(80);

      // Save database row
      await MediaService.saveFileMetadata({
        user_id: userId,
        folder_id: folderId,
        filename: file.name,
        file_path: path,
        file_size: file.size,
        mime_type: file.type,
        category,
        permission_level: 'private',
        thumbnail_path: publicUrl
      });

      setUploadProgress(100);
      await UploadService.logUpload(userId, file.name, file.size, 'success');
      toast.success('File uploaded successfully!');
    } catch (err: any) {
      toast.error('Upload failed: ' + err.message);
      await UploadService.logUpload(userId, file.name, file.size, 'failed', err.message);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, [userId]);

  return {
    uploadFile,
    uploadProgress,
    uploading
  };
};

export default useUpload;
