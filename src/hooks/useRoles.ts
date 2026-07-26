// FitSync Hook: useRoles
// Queries and manages Role Based Access Control assignments

import { useState, useEffect, useCallback } from 'react';
import { RoleService } from '../services/role';

export const useRoles = (userId?: string) => {
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRoles = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const list = await RoleService.getUserRoles(userId);
      setRoles(list);
    } catch (err) {
      console.error('Failed to load user roles:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const assignRole = async (targetUserId: string, roleName: string) => {
    await RoleService.assignRole(targetUserId, roleName);
    if (targetUserId === userId) {
      await fetchRoles();
    }
  };

  const removeRole = async (targetUserId: string, roleName: string) => {
    await RoleService.removeRole(targetUserId, roleName);
    if (targetUserId === userId) {
      await fetchRoles();
    }
  };

  const isUserAdmin = roles.includes('admin') || roles.includes('super_admin');
  const isUserModerator = roles.includes('moderator') || isUserAdmin;

  return {
    roles,
    loading,
    assignRole,
    removeRole,
    isAdmin: isUserAdmin,
    isModerator: isUserModerator,
    refetch: fetchRoles
  };
};

export default useRoles;
