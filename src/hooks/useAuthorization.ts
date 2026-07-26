// FitSync Hook: useAuthorization
// Checks permissions clearances for authenticated sessions in React UI components

import { useState, useEffect } from 'react';
import { AuthorizationService } from '../services/security/authorization';

export const useAuthorization = (userId: string, permissionName: string) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    if (!userId) {
      setHasPermission(false);
      return;
    }
    
    AuthorizationService.checkUserPermission(userId, permissionName)
      .then(setHasPermission)
      .catch(() => setHasPermission(false));
  }, [userId, permissionName]);

  return {
    hasPermission
  };
};

export default useAuthorization;
