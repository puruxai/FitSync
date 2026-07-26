// FitSync Environment Service
// Manages environment separation configurations (development, testing, staging, production)

export type EnvironmentType = 'development' | 'testing' | 'staging' | 'production';

export interface EnvConfig {
  mode: EnvironmentType;
  supabaseUrl: string;
  enableRealtime: boolean;
  enableDebugLogging: boolean;
  observabilityEndpoint: string;
}

const DEV_CONFIG: EnvConfig = {
  mode: 'development',
  supabaseUrl: 'http://localhost:54321',
  enableRealtime: true,
  enableDebugLogging: true,
  observabilityEndpoint: 'http://localhost:4318/v1/metrics'
};

const PROD_CONFIG: EnvConfig = {
  mode: 'production',
  supabaseUrl: 'https://fitsync-prod.supabase.co',
  enableRealtime: true,
  enableDebugLogging: false,
  observabilityEndpoint: 'https://otel.fitsync.com/v1/metrics'
};

export const EnvironmentService = {
  /**
   * Get active environment mode
   */
  getActiveMode(): EnvironmentType {
    const mode = import.meta.env.MODE;
    if (mode === 'production') return 'production';
    if (mode === 'staging') return 'staging';
    if (mode === 'test') return 'testing';
    return 'development';
  },

  /**
   * Get configuration based on mode
   */
  getConfig(): EnvConfig {
    const mode = this.getActiveMode();
    if (mode === 'production' || mode === 'staging') {
      return PROD_CONFIG;
    }
    return DEV_CONFIG;
  }
};
export default EnvironmentService;
