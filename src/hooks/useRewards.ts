// FitSync Hook: useRewards
// Manages loading awarded achievement badges and claiming point-based rewards

import { useState, useEffect, useCallback } from 'react';
import { RewardService, type LeaderboardBadge, type LeaderboardReward } from '../services/reward';

export const useRewards = (userId?: string) => {
  const [badges, setBadges] = useState<LeaderboardBadge[]>([]);
  const [rewards, setRewards] = useState<LeaderboardReward[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRewardData = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const [bList, rList] = await Promise.all([
        RewardService.getUserBadges(userId),
        RewardService.getUserRewards(userId)
      ]);
      setBadges(bList);
      setRewards(rList);
    } catch (err) {
      console.error('Failed to load rewards details:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchRewardData();
  }, [fetchRewardData]);

  const claimPoints = async (rewardId: string) => {
    try {
      await RewardService.claimReward(rewardId);
      setRewards(prev =>
        prev.map(r => r.id === rewardId ? { ...r, is_claimed: true, claimed_at: new Date().toISOString() } : r)
      );
    } catch (err) {
      console.error('Failed to claim reward:', err);
    }
  };

  return {
    badges,
    rewards,
    loading,
    claimPoints,
    refetch: fetchRewardData
  };
};

export default useRewards;
