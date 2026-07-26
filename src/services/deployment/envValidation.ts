// FitSync Environment Variable Validation Service
// Performs startup checks to verify essential connection strings and keys exist

export const EnvironmentValidationService = {
  /**
   * Validate required VITE environment keys
   * Returns true if all valid, false otherwise (without throwing to prevent page crashes)
   */
  validateEnvironment(): boolean {
    const required = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY'
    ];

    const missing = required.filter(
      (key) => !import.meta.env[key]
    );

    if (missing.length > 0) {
      const isProd = import.meta.env.PROD;
      const msg = `[Deployment Monitor] Missing required credentials: ${missing.join(', ')}.`;
      console.warn(msg);
      if (isProd) {
        throw new Error(msg);
      }
      return false;
    }

    console.log('[Deployment Monitor] Environment credentials validated successfully.');
    return true;
  }
};
export default EnvironmentValidationService;
