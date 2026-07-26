// FitSync Hook: useSessions
// Manages querying active login device sessions and revoking access tokens

import { useState, useEffect, useCallback } from 'react';
import { SessionService, type UserSession } from '../services/session';

export const useSessions = (userId?: string) => {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSessions = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const list = await SessionService.getSessions(userId);
      setSessions(list);
    } catch (err) {
      console.error('Failed to load active sessions:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const revokeSession = async (id: string) => {
    await SessionService.revokeSession(id);
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const revokeAllExceptCurrent = async () => {
    if (!userId) return;
    await SessionService.revokeAllExceptCurrent(userId);
    setSessions(prev => prev.filter(s => s.is_current));
  };

  return {
    sessions,
    loading,
    revokeSession,
    revokeAllExceptCurrent,
    refetch: fetchSessions
  };
};

export default useSessions;
