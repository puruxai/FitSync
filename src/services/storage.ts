// FitSync Storage Service
// Handles upload and deletion of avatar and cover images via Supabase Storage or local base64 caching

import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const StorageService = {
  /**
   * Upload an avatar image
   * @param userId Authenticated user ID
   * @param file File to upload
   * @returns Public URL of the uploaded image
   */
  async uploadAvatar(userId: string, file: File): Promise<string> {
    if (isSupabaseConfigured) {
      // Force unique name per upload to bypass browser image cache
      const fileExt = file.name.split('.').pop() || 'png';
      const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { 
          upsert: true,
          contentType: file.type,
          cacheControl: '3600'
        });

      if (error) {
        throw new Error(`Failed to upload avatar: ${error.message}`);
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } else {
      // Offline mode: convert to base64 Data URL so it behaves like a persistent URL
      return this.fileToDataUrl(file);
    }
  },

  /**
   * Delete user avatar file
   * @param userId Authenticated user ID
   */
  async deleteAvatar(userId: string): Promise<void> {
    if (isSupabaseConfigured) {
      // List all files in the user's folder and delete them
      const { data: files, error: listError } = await supabase.storage
        .from('avatars')
        .list(userId);

      if (listError || !files || files.length === 0) return;

      const pathsToDelete = files.map(file => `${userId}/${file.name}`);
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove(pathsToDelete);

      if (deleteError) {
        throw new Error(`Failed to delete avatar: ${deleteError.message}`);
      }
    }
  },

  /**
   * Upload a cover image
   * @param userId Authenticated user ID
   * @param file File to upload
   * @returns Public URL of the uploaded image
   */
  async uploadCover(userId: string, file: File): Promise<string> {
    if (isSupabaseConfigured) {
      const fileExt = file.name.split('.').pop() || 'png';
      const filePath = `${userId}/cover-${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from('covers')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
          cacheControl: '3600'
        });

      if (error) {
        throw new Error(`Failed to upload cover: ${error.message}`);
      }

      const { data } = supabase.storage
        .from('covers')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } else {
      return this.fileToDataUrl(file);
    }
  },

  /**
   * Delete user cover file
   * @param userId Authenticated user ID
   */
  async deleteCover(userId: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { data: files, error: listError } = await supabase.storage
        .from('covers')
        .list(userId);

      if (listError || !files || files.length === 0) return;

      const pathsToDelete = files.map(file => `${userId}/${file.name}`);
      const { error: deleteError } = await supabase.storage
        .from('covers')
        .remove(pathsToDelete);

      if (deleteError) {
        throw new Error(`Failed to delete cover: ${deleteError.message}`);
      }
    }
  },

  /**
   * Helper to convert a file to Base64 Data URL for offline mode
   */
  fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }
};
