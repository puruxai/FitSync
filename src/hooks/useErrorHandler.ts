// FitSync Hook: useErrorHandler
// Captures exceptions and reports them to database logs with severity details

import { useCallback } from 'react';
import { ErrorTrackingService, type ErrorSeverity } from '../services/recovery/errorTracking';

export const useErrorHandler = (componentName: string) => {
  const handleError = useCallback((error: Error, severity: ErrorSeverity = 'medium') => {
    ErrorTrackingService.reportError(error, severity, componentName);
  }, [componentName]);

  return {
    handleError
  };
};

export default useErrorHandler;
