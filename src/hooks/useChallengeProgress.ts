// FitSync Hook: useChallengeProgress
// Automatically tracks user completion progress percent and predicts challenge winners

import { useState, useEffect, useCallback } from 'react';
import { ChallengeProgressService } from '../services/challengeProgress';
import { ChallengeLeaderboardService } from '../services/challengeLeaderboard';

export const useChallengeProgress = (challengeId?: string, userId?: string, goalValue: number = 1) => {
  const [progressValue, setProgressValue] = useState(0);
  const [percent, setPercent] = useState(0);
  const [predictedWinner, setPredictedWinner] = useState<string>('Unknown');
  const [loading, setLoading] = useState(false);

  const fetchProgress = useCallback(async () => {
    if (!challengeId || !userId) return;
    try {
      setLoading(true);
      const list = await ChallengeProgressService.getChallengeProgress(challengeId);
      const userProg = list.find(p => p.user_id === userId);
      
      const val = userProg?.value || 0;
      setProgressValue(val);
      setPercent(Math.min(100, Math.round((val / goalValue) * 100)));

      // Winner prediction: Participant with highest progress score
      const standings = await ChallengeLeaderboardService.getStandings(challengeId);
      if (standings.length > 0) {
        setPredictedWinner(standings[0].profile?.full_name || 'Athlete');
      } else {
        setPredictedWinner('Nobody yet');
      }
    } catch (err) {
      console.error('Failed to load challenge progress:', err);
    } finally {
      setLoading(false);
    }
  }, [challengeId, userId, goalValue]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    progressValue,
    percent,
    predictedWinner,
    loading,
    refetch: fetchProgress
  };
};

export default useChallengeProgress;
