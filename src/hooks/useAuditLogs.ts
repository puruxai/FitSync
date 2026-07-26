// FitSync Hook: useAuditLogs
// Loads system administration audit trails logs

import { useState, useEffect, useCallback } from 'react';
import { AuditService, type AuditLog } from '../services/audit';

export const useAuditLogs = (active = false) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    if (!active) return;
    try {
      setLoading(true);
      const data = await AuditService.getLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  }, [active]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    loading,
    refetch: fetchLogs
  };
};

export default useAuditLogs;
