// FitSync Central Configuration Constants
// Consolidates configuration schemas, feature toggles, and size thresholds

export const FITSYNC_CONFIG = {
  VERSION: '1.4.0',
  API_BASE_URL: 'https://api.fitsync.com/v1',
  
  // Cache TTL Settings (in milliseconds)
  CACHE_TTL_MS: 5 * 60 * 1000, // 5 minutes default
  
  // Media Storage Thresholds
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5MB limit
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/quicktime'],

  // Circuit Breaker Settings
  BREAKER_COOLDOWN_MS: 5000,
  BREAKER_FAILURE_THRESHOLD: 3
};

export default FITSYNC_CONFIG;
