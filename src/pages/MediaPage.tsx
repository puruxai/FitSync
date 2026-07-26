// FitSync Page: MediaPage
// Implements enterprise-grade storage: previews media files, manages folder mappings, and uploads clipboard screenshots

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

export const MediaPage: React.FC = () => {
  const { profile } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>('general');
  const [searchQuery, setSearchQuery] = useState('');

  // Load custom hooks
  const { files, loading: mediaLoading, deleteFile, updatePermission } = useMedia(profile?.id);
  const { uploadFile, uploadProgress, uploading } = useUpload(profile?.id);
  const { usage, loading: storageLoading } = useStorage(profile?.id);

  const categories = [
    { id: 'general', label: 'All Files', icon: 'folder' },
    { id: 'profile_photo', label: 'Avatars', icon: 'portrait' },
    { id: 'workout_image', label: 'Workouts', icon: 'fitness_center' },
    { id: 'export_file', label: 'Exports Logs', icon: 'download' }
  ];

  const handleUploadTrigger = async (file: File) => {
    await uploadFile(file, activeCategory);
  };

  const filteredFiles = files.filter(f => {
    const matchesCategory = activeCategory === 'general' || f.category === activeCategory;
    const matchesSearch = f.filename.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!profile) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto pb-24 lg:pb-8">
      
      {/* Title Header */}
      <div className="text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-4 select-none">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
            Media Library
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
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
          <Card variant="glass" className="p-4 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl space-y-2">
            <h4 className="text-[10px] font-black uppercase text-slate-400 px-1 mb-2">Folders categories</h4>
            
            <div className="space-y-1">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-brand-500/10 text-brand-650 dark:text-brand-450 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'
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
          <div className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30 p-4 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl select-none text-left">
            <div className="relative w-72">
              <input
                placeholder="Search files by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/30 rounded-xl focus:outline-none dark:text-white"
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
            <Card variant="glass" className="p-12 text-center border border-slate-200/50 dark:border-slate-800/40 rounded-3xl text-slate-450 font-bold select-none">
              No files uploaded to this folder yet.
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredFiles.map(file => (
                <MediaCard
                  key={file.id}
                  file={file}
                  onDelete={deleteFile}
                  onPermissionChange={updatePermission}
                />
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default MediaPage;
