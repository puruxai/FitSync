// FitSync Video Analytics Service
// Extracts duration summaries from video files

export const VideoService = {
  /**
   * Reads video duration in seconds
   */
  getVideoDuration(file: File): Promise<number> {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve(video.duration);
      };
      video.onerror = () => {
        resolve(0);
      };
      video.src = url;
    });
  }
};
export default VideoService;
