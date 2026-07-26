// FitSync Media Metadata Service
// Handles database operations for files categorizations, folders list, permissions logs, and tag mappings

import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { getFromMockDb, saveToMockDb } from '../mockDb';

export interface MediaFile {
  id: string;
  user_id: string;
  folder_id?: string;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  category: string;
  permission_level: 'public' | 'friends' | 'private' | 'admin';
  thumbnail_path?: string;
  created_at: string;
  tags?: string[];
}

export interface MediaFolder {
  id: string;
  user_id: string;
  name: string;
  parent_id?: string;
  created_at: string;
}

export const MediaService = {
  /**
   * Get user files list
   */
  async getFiles(userId: string, folderId?: string): Promise<MediaFile[]> {
    if (isSupabaseConfigured) {
      let query = supabase.from('media_files').select('*').eq('user_id', userId);
      if (folderId) {
        query = query.eq('folder_id', folderId);
      } else {
        query = query.is('folder_id', null);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return (data as unknown as MediaFile[]) || [];
    } else {
      const list = getFromMockDb<MediaFile>('media_files');
      return list.filter(f => f.user_id === userId && (folderId ? f.folder_id === folderId : !f.folder_id));
    }
  },

  /**
   * Register file upload metadata row
   */
  async saveFileMetadata(file: Omit<MediaFile, 'id' | 'created_at'>): Promise<MediaFile> {
    const payload = {
      ...file,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('media_files')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as MediaFile;
    } else {
      const list = getFromMockDb<MediaFile>('media_files');
      const newFile = {
        id: 'file-' + Math.random().toString(36).substr(2, 9),
        ...payload
      };
      list.push(newFile);
      saveToMockDb('media_files', list);
      return newFile;
    }
  },

  /**
   * Delete file metadata and delete from storage
   */
  async deleteFile(fileId: string): Promise<void> {
    if (isSupabaseConfigured) {
      // Fetch path first
      const { data } = await supabase.from('media_files').select('file_path, category').eq('id', fileId).single();
      if (data) {
        // Delete from DB
        await supabase.from('media_files').delete().eq('id', fileId);
      }
    } else {
      const list = getFromMockDb<MediaFile>('media_files');
      const filtered = list.filter(f => f.id !== fileId);
      saveToMockDb('media_files', filtered);
    }
  },

  /**
   * Create folder structure
   */
  async createFolder(userId: string, name: string, parentId?: string): Promise<MediaFolder> {
    const payload = {
      user_id: userId,
      name,
      parent_id: parentId,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('media_folders')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as MediaFolder;
    } else {
      const list = getFromMockDb<MediaFolder>('media_folders');
      const newFolder = {
        id: 'fold-' + Math.random().toString(36).substr(2, 9),
        ...payload
      };
      list.push(newFolder);
      saveToMockDb('media_folders', list);
      return newFolder;
    }
  },

  /**
   * Get folders list
   */
  async getFolders(userId: string, parentId?: string): Promise<MediaFolder[]> {
    if (isSupabaseConfigured) {
      let query = supabase.from('media_folders').select('*').eq('user_id', userId);
      if (parentId) {
        query = query.eq('parent_id', parentId);
      } else {
        query = query.is('parent_id', null);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data as unknown as MediaFolder[]) || [];
    } else {
      const list = getFromMockDb<MediaFolder>('media_folders');
      return list.filter(f => f.user_id === userId && (parentId ? f.parent_id === parentId : !f.parent_id));
    }
  },

  /**
   * Update file sharing permission level
   */
  async updatePermission(fileId: string, level: MediaFile['permission_level']): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase
        .from('media_files')
        .update({ permission_level: level })
        .eq('id', fileId);
    } else {
      const list = getFromMockDb<MediaFile>('media_files');
      const idx = list.findIndex(f => f.id === fileId);
      if (idx !== -1) {
        list[idx].permission_level = level;
        saveToMockDb('media_files', list);
      }
    }
  }
};
export default MediaService;
