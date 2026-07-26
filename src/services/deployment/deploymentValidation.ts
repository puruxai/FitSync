// FitSync Deployment Validation Service
// Performs post-deployment verification calls to confirm connectivity and configurations

import { EnvironmentValidationService } from './envValidation';
import { HealthCheckService } from './healthCheck';

export const DeploymentValidationService = {
  /**
   * Run all startup validation checks
   */
  async runStartupValidation(): Promise<{
    envValid: boolean;
    healthStatus: string;
    databaseConnected: boolean;
  }> {
    const envValid = EnvironmentValidationService.validateEnvironment();
    const health = await HealthCheckService.runHealthCheck();

    return {
      envValid,
      healthStatus: health.status,
      databaseConnected: health.databaseConnected
    };
  }
};
export default DeploymentValidationService;
