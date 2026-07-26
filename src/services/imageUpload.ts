// FitSync Image Upload & Compression Service
// Handles client-side scaling, center-cropping, format verification, and JPEG compression

export const ImageUploadService = {
  MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5 MB
  SUPPORTED_FORMATS: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],

  /**
   * Validate file size and type
   */
  validateFile(file: File): { valid: boolean; error: string | null } {
    if (!this.SUPPORTED_FORMATS.includes(file.type)) {
      return { valid: false, error: 'Unsupported file format. Use JPG, JPEG, PNG, or WEBP.' };
    }
    if (file.size > this.MAX_SIZE_BYTES) {
      return { valid: false, error: 'File size exceeds the 5MB limit.' };
    }
    return { valid: true, error: null };
  },

  /**
   * Resize, crop, and compress an image file
   * @param file Input file from form input
   * @param targetType 'avatar' (300x300 square) or 'cover' (1200x400 landscape)
   * @returns Compressed File object
   */
  processImage(file: File, targetType: 'avatar' | 'cover'): Promise<File> {
    return new Promise((resolve, reject) => {
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return reject(new Error(validation.error || 'Invalid file.'));
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);

        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            return reject(new Error('Canvas context not available.'));
          }

          let targetWidth = 300;
          let targetHeight = 300;

          if (targetType === 'cover') {
            targetWidth = 1200;
            targetHeight = 400;
          }

          canvas.width = targetWidth;
          canvas.height = targetHeight;

          // Perform center crop calculations
          const imgWidth = img.width;
          const imgHeight = img.height;
          const targetAspectRatio = targetWidth / targetHeight;
          const imgAspectRatio = imgWidth / imgHeight;

          let sourceX = 0;
          let sourceY = 0;
          let sourceWidth = imgWidth;
          let sourceHeight = imgHeight;

          if (imgAspectRatio > targetAspectRatio) {
            // Source is wider than target aspect ratio: crop sides
            sourceWidth = imgHeight * targetAspectRatio;
            sourceX = (imgWidth - sourceWidth) / 2;
          } else if (imgAspectRatio < targetAspectRatio) {
            // Source is taller than target aspect ratio: crop top/bottom
            sourceHeight = imgWidth / targetAspectRatio;
            sourceY = (imgHeight - sourceHeight) / 2;
          }

          // Draw cropped and scaled image onto canvas
          ctx.drawImage(
            img,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            0,
            0,
            targetWidth,
            targetHeight
          );

          // Compress to JPEG with 85% quality
          canvas.toBlob(
            blob => {
              if (blob) {
                const processedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                resolve(processedFile);
              } else {
                reject(new Error('Image compression failed.'));
              }
            },
            'image/jpeg',
            0.85
          );
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load image.'));
      };

      img.src = objectUrl;
    });
  }
};
