// FitSync API Versioning & Compatibility Service
// Validates API route formats and tracks active deprecations window

export interface VersionInfo {
  version: string;
  status: 'active' | 'deprecated' | 'sunsetted';
  sunsetDate?: string;
}

const ACTIVE_VERSIONS: Record<string, VersionInfo> = {
  'v1': { version: '1.4.0', status: 'active' },
  'v0': { version: '0.9.0', status: 'deprecated', sunsetDate: '2026-12-31' }
};

export const VersioningService = {
  /**
   * Get version info
   */
  getVersionDetails(apiVersion: string): VersionInfo | null {
    return ACTIVE_VERSIONS[apiVersion] || null;
  },

  /**
   * Verify route is compatible
   */
  isCompatible(apiVersion: string): boolean {
    const details = this.getVersionDetails(apiVersion);
    if (!details) return false;
    return details.status !== 'sunsetted';
  }
};
export default VersioningService;
