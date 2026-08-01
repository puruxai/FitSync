// FitSync Component: MediaCard
// Displays file preview card with permissions dropdowns, sizing stats, edit renames, and delete actions

import React from 'react';
import Card from '../ui/Card';
import type { MediaFile } from '../../services/storage/mediaService';

interface MediaCardProps {
  file: MediaFile;
  onDelete: (id: string) => Promise<void>;
  onRename: (id: string, newName: string) => Promise<void>;
  onPreview: (file: MediaFile) => void;
  onPermissionChange: (id: string, level: MediaFile['permission_level']) => Promise<void>;
  loading?: boolean;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  file,
  onDelete,
  onRename,
  onPreview,
  onPermissionChange,
  loading = false
}) => {
  const sizeMB = (file.file_size / (1024 * 1024)).toFixed(2);
  const isImage = file.mime_type.startsWith('image/');
  const isVideo = file.mime_type.startsWith('video/');

  return (
    <Card 
      variant="glass" 
      className="p-3 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl flex flex-col justify-between text-left select-none group min-h-60 overflow-hidden relative"
    >
      
      {/* File preview */}
      <div 
        onClick={() => onPreview(file)}
        className="w-full h-32 bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden mb-3 relative flex items-center justify-center cursor-zoom-in"
      >
        {isImage && (
          <img
            src={file.thumbnail_path || file.file_path}
            alt={file.filename}
            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-355"
            loading="lazy"
          />
        )}

        {isVideo && (
          <div className="w-full h-full flex items-center justify-center relative">
            <span className="material-symbols-outlined text-4xl text-slate-400">
              play_circle
            </span>
            <span className="absolute bottom-2 right-2 text-[9px] font-black bg-black/60 text-white px-1.5 py-0.5 rounded-md">
              Video
            </span>
          </div>
        )}

        {!isImage && !isVideo && (
          <span className="material-symbols-outlined text-4xl text-slate-400 animate-pulse">
            description
          </span>
        )}

        {/* Delete Overlay */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(file.id);
          }}
          disabled={loading}
          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer h-fit"
        >
          <span className="material-symbols-outlined text-[1.2em] leading-none">
            delete
          </span>
        </button>
      </div>

      {/* Meta details */}
      <div className="space-y-1 px-1">
        <div className="flex items-center justify-between gap-1 w-full overflow-hidden">
          <h4 className="text-[11px] font-black text-slate-850 dark:text-white truncate flex-grow" title={file.filename}>
            {file.filename}
          </h4>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const newName = prompt('Rename file:', file.filename);
              if (newName && newName.trim() !== '') {
                onRename(file.id, newName.trim());
              }
            }}
            className="text-slate-400 hover:text-brand-400 p-0.5 cursor-pointer h-fit flex items-center"
            title="Rename File"
          >
            <span className="material-symbols-outlined text-xs leading-none">edit</span>
          </button>
        </div>
        <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
          <span>{sizeMB} MB</span>
          <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase tracking-wider text-[8px] font-black">
            {file.category.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Permissions Select */}
      <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/30 flex justify-between items-center">
        <span className="text-[9px] font-black text-slate-400 uppercase">Sharing</span>
        <select
          value={file.permission_level}
          onChange={(e) => onPermissionChange(file.id, e.target.value as any)}
          disabled={loading}
          className="px-2 py-0.5 text-[9px] font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg dark:text-white focus:outline-none"
        >
          <option value="private">Private</option>
          <option value="friends">Friends</option>
          <option value="public">Public</option>
        </select>
      </div>

    </Card>
  );
};

export default MediaCard;
