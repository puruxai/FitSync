// FitSync AI Workout Generation Service
// Interfaces with the selected AI Provider to format and execute workout design queries

import { AIProviderService } from './aiProviderService';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { getFromMockDb, saveToMockDb } from '../mockDb';

export interface WorkoutGenerationSpecs {
  age: number;
  gender: string;
  weight: number;
  height: number;
  fitnessGoal: string;
  activityLevel: string;
  equipment: string;
  duration: number;
  experience: string;
  injuries?: string;
}

export const WorkoutAIService = {
  /**
   * Ask active AI provider to build workout
   */
  async generateWorkout(userId: string, specs: WorkoutGenerationSpecs): Promise<string> {
    const provider = await AIProviderService.getProvider(userId);

    const prompt = `Generate a personalized workout plan for a ${specs.age} year old ${specs.gender} weighing ${specs.weight}kg, height ${specs.height}cm.
Fitness Goal: ${specs.fitnessGoal}
Activity Level: ${specs.activityLevel}
Available Equipment: ${specs.equipment}
Preferred Session Duration: ${specs.duration} minutes
Fitness Experience: ${specs.experience}
Injuries or limitations: ${specs.injuries || 'none'}.

Format as structured markdown including warmups, exercise list (sets, reps, rest), and cool-down.`;

    const response = await provider.generateResponse(prompt);

    // Persist as recommendation in database
    const payload = {
      user_id: userId,
      category: 'workout',
      recommendation: response
    };

    if (isSupabaseConfigured) {
      await supabase.from('ai_recommendations').insert(payload);
    } else {
      const list = getFromMockDb<any>('ai_recommendations');
      list.push({
        id: 'rec-' + Math.random().toString(36).substr(2, 9),
        ...payload,
        created_at: new Date().toISOString()
      });
      saveToMockDb('ai_recommendations', list);
    }

    return response;
  }
};
export default WorkoutAIService;
