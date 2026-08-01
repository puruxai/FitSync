// FitSync Hook: useMedia
// Queries user folders, catalogs images list, and manages delete actions

import { useState, useEffect, useCallback } from 'react';
import { MediaService, type MediaFile, type MediaFolder } from '../services/storage/mediaService';

export const useMedia = (userId?: string, activeFolderId?: string) => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMedia = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const fs = await MediaService.getFiles(userId, activeFolderId);
      setFiles(fs);

      const fds = await MediaService.getFolders(userId, activeFolderId);
      setFolders(fds);
    } catch (err) {
      console.error('Failed to load media:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, activeFolderId]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const createFolder = async (name: string) => {
    if (!userId) return;
    await MediaService.createFolder(userId, name, activeFolderId);
    await fetchMedia();
  };

  const deleteFile = async (fileId: string) => {
    await MediaService.deleteFile(fileId);
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const renameFile = async (fileId: string, newName: string) => {
    await MediaService.renameFile(fileId, newName);
    setFiles(prev => 
      prev.map(f => f.id === fileId ? { ...f, filename: newName } : f)
    );
  };

  const updatePermission = async (fileId: string, level: MediaFile['permission_level']) => {
    await MediaService.updatePermission(fileId, level);
    setFiles(prev => 
      prev.map(f => f.id === fileId ? { ...f, permission_level: level } : f)
    );
  };

  return {
    files,
    folders,
    loading,
    createFolder,
    deleteFile,
    renameFile,
    updatePermission,
    refetch: fetchMedia
  };
};

export default useMedia;
