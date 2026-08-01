// FitSync Page: MediaPage
// Implements storage: previews media files, manages folder mappings, and uploads clipboard screenshots

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMedia } from '../hooks/useMedia';
import { useUpload } from '../hooks/useUpload';
import { useStorage } from '../hooks/useStorage';
import DropZone from '../components/storage/DropZone';
import MediaCard from '../components/storage/MediaCard';
import StorageUsageCard from '../components/storage/StorageUsageCard';
import Skeleton from '../components/ui/Skeleton';
import Card from '../components/ui/Card';
import type { MediaFile } from '../services/storage/mediaService';

export const MediaPage: React.FC = () => {
  const { profile, isLoading } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);

  // Load custom hooks
  const { files, loading: mediaLoading, deleteFile, renameFile, updatePermission, refetch: refetchMedia } = useMedia(profile?.id);
  const { uploadFile, uploadProgress, uploading } = useUpload(profile?.id);
  const { usage, loading: storageLoading, refetch: refetchStorage } = useStorage(profile?.id);

  const categories = [
    { id: 'general', label: 'All Files', icon: 'folder' },
    { id: 'profile_photo', label: 'Avatars', icon: 'portrait' },
    { id: 'workout_image', label: 'Workouts', icon: 'fitness_center' },
    { id: 'export_file', label: 'Exports Logs', icon: 'download' }
  ];

  const handleUploadTrigger = async (uploadedFiles: File[]) => {
    for (const file of uploadedFiles) {
      await uploadFile(file, activeCategory);
    }
    // Refresh files lists and quota usages
    refetchMedia();
    refetchStorage();
  };

  const handleRename = async (fileId: string, newName: string) => {
    await renameFile(fileId, newName);
    refetchMedia();
  };

  const filteredFiles = files.filter(f => {
    const matchesCategory = activeCategory === 'general' || f.category === activeCategory;
    const matchesSearch = f.filename.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-center space-y-4 max-w-7xl mx-auto">
        <div className="bg-[#121212] border border-brand-500/25 p-12 rounded-3xl max-w-md mx-auto">
          <span className="material-symbols-outlined text-red-500 text-5xl mb-4">error</span>
          <h2 className="text-xl font-bold text-white mb-2">Profile Load Error</h2>
          <p className="text-sm text-slate-400">
            Could not load user profile details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto pb-24 lg:pb-8">
      
      {/* Title Header */}
      <div className="text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-4 select-none">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight uppercase">
            Media Library
          </h1>
          <p className="text-sm font-semibold text-slate-400 mt-1">
            Store and organize workout videos, avatars, and exported progress sheets.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Toolbar panel */}
        <div className="lg:col-span-1 space-y-6 text-left select-none">
          
          {/* Storage capacity dial */}
          <StorageUsageCard
            bytesUsed={usage.bytesUsed}
            quotaBytes={usage.quotaBytes}
            loading={storageLoading}
          />

          {/* Folders navigation list */}
          <Card variant="glass" className="p-4 border border-slate-900 rounded-3xl space-y-2">
            <h4 className="text-[10px] font-black uppercase text-slate-500 px-1 mb-2">Folders categories</h4>
            
            <div className="space-y-1">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-brand-500/10 text-brand-400 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[1.3em]">
                    {cat.icon}
                  </span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </Card>

        </div>

        {/* Right main media files manager */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Upload drop region */}
          <DropZone
            onUpload={handleUploadTrigger}
            loading={uploading}
            uploadProgress={uploadProgress}
          />

          {/* Toolbar search */}
          <div className="flex justify-between items-center bg-slate-900/30 p-4 border border-slate-900 rounded-2xl select-none text-left">
            <div className="relative w-full">
              <input
                placeholder="Search files by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-slate-950 border border-slate-800 rounded-xl focus:outline-none text-white"
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                search
              </span>
            </div>
          </div>

          {/* Files grid list */}
          {mediaLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Skeleton className="h-60 rounded-3xl" />
              <Skeleton className="h-60 rounded-3xl" />
              <Skeleton className="h-60 rounded-3xl" />
            </div>
          ) : filteredFiles.length === 0 ? (
            <Card variant="glass" className="p-12 text-center border border-slate-900 rounded-3xl text-slate-500 font-bold select-none">
              No files uploaded to this folder yet.
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredFiles.map(file => (
                <MediaCard
                  key={file.id}
                  file={file}
                  onDelete={async (id) => {
                    await deleteFile(id);
                    refetchStorage();
                  }}
                  onRename={handleRename}
                  onPreview={(f) => setPreviewFile(f)}
                  onPermissionChange={async (id, lvl) => {
                    await updatePermission(id, lvl);
                  }}
                />
              ))}
            </div>
          )}

        </div>

      </div>

      {/* Media Preview Modal Overlay */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-slate-950 border border-brand-500/25 rounded-3xl shadow-[0_0_50px_rgba(57,255,20,0.15)] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-900">
              <div className="text-left">
                <h3 className="text-sm font-black text-white truncate max-w-md">{previewFile.filename}</h3>
                <p className="text-[10px] text-slate-500 uppercase mt-0.5">Category: {previewFile.category.replace('_', ' ')}</p>
              </div>
              <button 
                onClick={() => setPreviewFile(null)} 
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Display Body */}
            <div className="p-6 flex items-center justify-center bg-slate-900/40 min-h-80 max-h-[500px] overflow-y-auto">
              {previewFile.mime_type.startsWith('image/') ? (
                <img 
                  src={previewFile.thumbnail_path || previewFile.file_path} 
                  alt={previewFile.filename} 
                  className="max-h-[400px] object-contain rounded-2xl" 
                />
              ) : previewFile.mime_type.startsWith('video/') ? (
                <video 
                  src={previewFile.thumbnail_path || previewFile.file_path} 
                  controls 
                  autoPlay 
                  className="max-h-[400px] w-full rounded-2xl" 
                />
              ) : (
                <div className="text-center space-y-4">
                  <span className="material-symbols-outlined text-6xl text-brand-400">picture_as_pdf</span>
                  <p className="text-xs font-semibold text-slate-300">This is a PDF / Document file metadata node.</p>
                  <a 
                    href={previewFile.thumbnail_path || previewFile.file_path} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center justify-center font-bold px-6 py-2 rounded-full bg-brand-400 text-slate-950 hover:bg-brand-500 transition-colors text-xs tracking-wider"
                  >
                    Open Document Link
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MediaPage;
