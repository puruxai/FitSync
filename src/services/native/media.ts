// FitSync Capacitor Camera & Gallery Picker Service
// Integrates native android camera captures and storage uploads

export const NativeMediaService = {
  /**
   * Snaps photo using native camera dialog
   */
  async takePhoto(): Promise<string | null> {
    try {
      if (typeof window !== 'undefined' && !(window as any).Capacitor) {
        console.warn('Camera only available on native device sessions');
        return null;
      }

      const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });

      return photo.webPath || null;
    } catch {
      return null;
    }
  },

  /**
   * Picks cover photo file from Gallery
   */
  async pickGalleryImage(): Promise<string | null> {
    try {
      if (typeof window !== 'undefined' && !(window as any).Capacitor) {
        return null;
      }

      const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
      const photo = await Camera.getPhoto({
        quality: 90,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos
      });

      return photo.webPath || null;
    } catch {
      return null;
    }
  }
};

export default NativeMediaService;
