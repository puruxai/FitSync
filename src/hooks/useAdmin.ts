// FitSync Hook: useAdmin
// Fetches system summary statistics and profiles listings for enterprise administration dashboards

import { useState, useEffect, useCallback } from 'react';
import { AdminService, type AdminDashboardStats } from '../services/admin';

export const useAdmin = (active = false) => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAdminData = useCallback(async () => {
    if (!active) return;
    try {
      setLoading(true);
      const s = await AdminService.getDashboardStats();
      setStats(s);

      const u = await AdminService.getUsersList();
      setUsers(u);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  }, [active]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  return {
    stats,
    users,
    loading,
    refetch: fetchAdminData
  };
};

export default useAdmin;
