// FitSync Image Validation & Thumbnails Generator Simulation Service
// Calculates dimensions limits and formats mockup crop/resize configurations

export const ImageService = {
  /**
   * Reads image dimensions (width, height)
   */
  getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          resolve({ width: img.width, height: img.height });
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  },

  /**
   * Helper simulating image resizing output WebP
   */
  async simulateWebpCompression(file: File): Promise<Blob> {
    // In browser: we can simply pass back original file as Blob fallback
    return new Blob([file], { type: 'image/webp' });
  }
};
export default ImageService;
