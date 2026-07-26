// FitSync Challenge Leaderboard Service (Dual Mode: Supabase or Local Mock Fallback)
// Computes standings and positions for challenge participants based on progress values

import { ChallengeProgressService } from './challengeProgress';

export interface ChallengeRank {
  user_id: string;
  rank: number;
  score: number;
  profile?: any;
}

export const ChallengeLeaderboardService = {
  /**
   * Get challenge participants standings rankings
   */
  async getStandings(challengeId: string): Promise<ChallengeRank[]> {
    const progressList = await ChallengeProgressService.getChallengeProgress(challengeId);
    
    return progressList
      .sort((a, b) => b.value - a.value)
      .map((p, idx) => ({
        user_id: p.user_id,
        rank: idx + 1,
        score: p.value,
        profile: p.profile
      }));
  }
};
