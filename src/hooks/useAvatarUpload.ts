// FitSync Hook: useAvatarUpload
// Orchestrates image selection, client-side validation, Canvas cropping/compression, and Storage uploading

import { useState } from 'react';
import { StorageService } from '../services/storage';
import { ImageUploadService } from '../services/imageUpload';
import { ProfileService } from '../services/profile';
import toast from 'react-hot-toast';

export const useAvatarUpload = (userId?: string, onUpdateSuccess?: (newUrl: string, field: 'avatar_url' | 'cover_url') => void) => {
  const [uploading, setUploading] = useState(false);

  const uploadPhoto = async (file: File, type: 'avatar' | 'cover'): Promise<string> => {
    if (!userId) throw new Error('User not logged in.');

    try {
      setUploading(true);

      // 1. Client-side crop & compression using ImageUploadService
      toast.loading(`Processing and compressing ${type}...`, { id: 'upload-toast' });
      const processedFile = await ImageUploadService.processImage(file, type);

      // 2. Storage upload using StorageService
      toast.loading(`Uploading ${type} to Supabase...`, { id: 'upload-toast' });
      let publicUrl = '';
      if (type === 'avatar') {
        publicUrl = await StorageService.uploadAvatar(userId, processedFile);
      } else {
        publicUrl = await StorageService.uploadCover(userId, processedFile);
      }

      // 3. Database profile update
      toast.loading(`Updating user profile database...`, { id: 'upload-toast' });
      const field = type === 'avatar' ? 'avatar_url' : 'cover_url';
      await ProfileService.updateProfile(userId, { [field]: publicUrl });

      toast.success(`${type === 'avatar' ? 'Avatar' : 'Cover image'} updated successfully!`, { id: 'upload-toast' });
      
      if (onUpdateSuccess) {
        onUpdateSuccess(publicUrl, field);
      }

      return publicUrl;
    } catch (err: any) {
      toast.error(err.message || `Failed to upload ${type}.`, { id: 'upload-toast' });
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (type: 'avatar' | 'cover'): Promise<void> => {
    if (!userId) throw new Error('User not logged in.');

    try {
      setUploading(true);
      toast.loading(`Removing ${type}...`, { id: 'delete-toast' });

      if (type === 'avatar') {
        await StorageService.deleteAvatar(userId);
        await ProfileService.updateProfile(userId, { avatar_url: '' });
      } else {
        await StorageService.deleteCover(userId);
        await ProfileService.updateProfile(userId, { cover_url: '' });
      }

      toast.success(`${type === 'avatar' ? 'Avatar' : 'Cover image'} removed successfully!`, { id: 'delete-toast' });
      
      if (onUpdateSuccess) {
        onUpdateSuccess('', type === 'avatar' ? 'avatar_url' : 'cover_url');
      }
    } catch (err: any) {
      toast.error(err.message || `Failed to delete ${type}.`, { id: 'delete-toast' });
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    uploadAvatar: (file: File) => uploadPhoto(file, 'avatar'),
    uploadCover: (file: File) => uploadPhoto(file, 'cover'),
    deleteAvatar: () => deletePhoto('avatar'),
    deleteCover: () => deletePhoto('cover')
  };
};

export default useAvatarUpload;
