// FitSync Component: DropZone
// Provides premium drag-and-drop region and handles copy-paste clipboard uploads

import React, { useState, useEffect, useRef } from 'react';
import Card from '../ui/Card';

interface DropZoneProps {
  onUpload: (file: File) => Promise<void>;
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

  // Paste image event listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            onUpload(file);
          }
        }
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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      ref={dropRef}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className="relative select-none"
    >
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
          Drag and drop files here to upload
        </p>
        <p className="text-[10px] text-slate-400 mt-1 font-semibold">
          Supports Photos, Videos, and PDFs. Or simply copy and paste (`Ctrl+V`) screenshots directly!
        </p>

        {loading && (
          <div className="w-full mt-6 space-y-2 max-w-xs">
            <div className="flex justify-between items-center text-[10px] font-black text-slate-400">
              <span>Uploading File...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
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
