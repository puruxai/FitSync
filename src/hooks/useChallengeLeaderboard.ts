// FitSync Hook: useChallengeLeaderboard
// Manages real-time active standings rank lists for challenge participants

import { useState, useEffect, useCallback } from 'react';
import { ChallengeLeaderboardService, type ChallengeRank } from '../services/challengeLeaderboard';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const useChallengeLeaderboard = (challengeId?: string) => {
  const [standings, setStandings] = useState<ChallengeRank[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStandings = useCallback(async () => {
    if (!challengeId) return;
    try {
      setLoading(true);
      const data = await ChallengeLeaderboardService.getStandings(challengeId);
      setStandings(data);
    } catch (err) {
      console.error('Failed to load standings:', err);
    } finally {
      setLoading(false);
    }
  }, [challengeId]);

  useEffect(() => {
    fetchStandings();
  }, [fetchStandings]);

  // Realtime subscription sync
  useEffect(() => {
    if (!challengeId || !isSupabaseConfigured) return;

    const channel = supabase
      .channel(`live-challenge-leaderboard:${challengeId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'challenge_progress', filter: `challenge_id=eq.${challengeId}` },
        () => {
          // Instant refresh rankings
          fetchStandings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [challengeId, fetchStandings]);

  return {
    standings,
    loading,
    refetch: fetchStandings
  };
};

export default useChallengeLeaderboard;
