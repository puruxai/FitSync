// FitSync Component: ImageUploadModal
// A modal dialogue that manages file upload selections, format validations, loading states, and media deletions

import React, { useRef, useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'avatar' | 'cover';
  currentImageUrl?: string;
  onUpload: (file: File) => Promise<any>;
  onDelete: () => Promise<void>;
  loading?: boolean;
}

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  type,
  currentImageUrl,
  onUpload,
  onDelete,
  loading = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setValidationError(null);
    if (!file) return;

    // Basic format checks
    const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!supportedFormats.includes(file.type)) {
      setValidationError('Unsupported format. Please select JPG, JPEG, PNG, or WEBP.');
      return;
    }

    // Size check
    if (file.size > 5 * 1024 * 1024) {
      setValidationError('File size exceeds the 5MB maximum limit.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleUploadClick = async () => {
    if (!selectedFile) return;
    try {
      await onUpload(selectedFile);
      handleCancelSelection();
      onClose();
    } catch {
      // Errors are handled in Hook toasted feedback
    }
  };

  const handleDeleteClick = async () => {
    if (window.confirm(`Are you sure you want to delete your current ${type === 'avatar' ? 'avatar' : 'cover'} photo?`)) {
      try {
        await onDelete();
        handleCancelSelection();
        onClose();
      } catch {
        // Errors are handled in Hook toasted feedback
      }
    }
  };

  const handleCancelSelection = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <Card 
        variant="glass" 
        className="w-full max-w-md p-6 border border-slate-100 dark:border-slate-800 text-center shadow-2xl relative"
      >
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 cursor-pointer p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
        >
          <span className="material-symbols-outlined text-[1.35em]">close</span>
        </button>

        <h3 className="text-sm font-black text-slate-950 dark:text-white mb-2">
          Update {type === 'avatar' ? 'Profile Picture' : 'Cover Photo'}
        </h3>
        <p className="text-[10px] text-slate-400 font-semibold mb-6">
          Resize and compress automatically before uploading. PNG, JPG, or WEBP up to 5MB.
        </p>

        {/* Preview Frame */}
        <div className="flex justify-center mb-6">
          {previewUrl || currentImageUrl ? (
            <div className="relative group overflow-hidden bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-3xl p-1 shadow-sm">
              <img
                src={previewUrl || currentImageUrl}
                alt="Preview"
                className={`object-cover ${
                  type === 'avatar' 
                    ? 'w-32 h-32 rounded-3xl' 
                    : 'w-72 h-24 rounded-2xl'
                }`}
              />
              {previewUrl && (
                <button
                  onClick={handleCancelSelection}
                  disabled={loading}
                  className="absolute top-2 right-2 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full p-1 cursor-pointer transition-colors"
                  title="Remove selection"
                >
                  <span className="material-symbols-outlined text-[1.1em]">delete</span>
                </button>
              )}
            </div>
          ) : (
            <div 
              onClick={triggerFileSelect}
              className={`border-2 border-dashed border-slate-200 dark:border-slate-850 hover:border-brand-500 rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-colors p-6 bg-slate-50/50 dark:bg-slate-950/20 ${
                type === 'avatar' ? 'w-32 h-32' : 'w-72 h-24'
              }`}
            >
              <span className="material-symbols-outlined text-2xl text-slate-400">upload_file</span>
              <span className="text-[8px] text-slate-400 font-black mt-2 uppercase tracking-wider">Select File</span>
            </div>
          )}
        </div>

        {validationError && (
          <p className="text-[10px] text-red-500 font-bold mb-4">{validationError}</p>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/jpg, image/webp"
          className="hidden"
        />

        {/* Action Controls */}
        <div className="flex flex-col gap-2.5">
          {!previewUrl ? (
            <Button
              onClick={triggerFileSelect}
              disabled={loading}
              variant="secondary"
              leftIcon="photo_library"
              className="w-full text-xs"
            >
              Browse Photo
            </Button>
          ) : (
            <Button
              onClick={handleUploadClick}
              isLoading={loading}
              variant="primary"
              leftIcon="cloud_upload"
              className="w-full text-xs"
            >
              Upload Photo
            </Button>
          )}

          {currentImageUrl && !previewUrl && (
            <Button
              onClick={handleDeleteClick}
              disabled={loading}
              variant="secondary"
              leftIcon="no_photography"
              className="w-full text-xs text-red-500 hover:text-red-600 dark:hover:text-red-400"
            >
              Delete Current Photo
            </Button>
          )}

          <Button
            onClick={onClose}
            disabled={loading}
            variant="secondary"
            className="w-full text-xs"
          >
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ImageUploadModal;
