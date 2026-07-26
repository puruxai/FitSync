// FitSync Recommendation Service (Dual Mode: Supabase or Local Mock Fallback)
// Recommends workout routines based on target goals or profile attributes

import { WorkoutService, type Workout } from './workout';

export const RecommendationService = {
  /**
   * Get recommendations for a user
   */
  async getRecommendations(_userId: string, fitnessGoal: string = 'stamina'): Promise<Workout[]> {
    const list = await WorkoutService.getWorkouts();
    
    // Filter matching target goal or category
    const matched = list.filter(w => 
      w.target_goal === fitnessGoal || 
      w.category === 'hiit' || 
      w.difficulty === 'beginner'
    );

    if (matched.length > 0) return matched;
    // Fallback: slice top 3
    return list.slice(0, 3);
  }
};
export default RecommendationService;
