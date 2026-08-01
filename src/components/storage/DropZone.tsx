// FitSync Component: DropZone
// Provides premium drag-and-drop region, click-to-select multiple files, and copy-paste clipboard uploads

import React, { useState, useEffect, useRef } from 'react';
import Card from '../ui/Card';

interface DropZoneProps {
  onUpload: (files: File[]) => Promise<void>;
  loading?: boolean;
  uploadProgress?: number;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onUpload,
  loading = false,
  uploadProgress = 0
}) => {
  const [dragActive, setDragActive] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Paste image event listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const pastedFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            pastedFiles.push(file);
          }
        }
      }
      if (pastedFiles.length > 0) {
        onUpload(pastedFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onUpload]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(Array.from(e.dataTransfer.files));
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // Avoid double clicks on inputs or internal action triggers
    if (e.target === fileInputRef.current) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(Array.from(e.target.files));
    }
  };

  return (
    <div 
      ref={dropRef}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={handleClick}
      className="relative select-none cursor-pointer"
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      <Card 
        variant="glass" 
        className={`p-10 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-center transition-all ${
          dragActive
            ? 'border-brand-500 bg-brand-500/5 scale-[0.99]'
            : 'border-slate-200 dark:border-slate-800/40'
        }`}
      >
        <span className={`material-symbols-outlined text-4xl mb-4 transition-all ${dragActive ? 'text-brand-500 scale-110' : 'text-slate-400'}`}>
          cloud_upload
        </span>

        <p className="text-xs font-bold text-slate-850 dark:text-white leading-tight">
          Drag and drop files here or click to upload
        </p>
        <p className="text-[10px] text-slate-400 mt-1 font-semibold">
          Supports multiple Photos, Videos, and PDFs. Or copy-paste (`Ctrl+V`) clipboard screenshots!
        </p>

        {loading && (
          <div className="w-full mt-6 space-y-2 max-w-xs" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center text-[10px] font-black text-slate-400">
              <span>Uploading Files...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-850 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-brand-500 h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DropZone;
