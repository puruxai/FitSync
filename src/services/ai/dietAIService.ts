// FitSync AI Diet Planner Service
// Interfaces with the selected AI Provider to format and execute nutrition meal plans design queries

import { AIProviderService } from './aiProviderService';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { getFromMockDb, saveToMockDb } from '../mockDb';

export interface DietGenerationSpecs {
  dietGoal: 'loss' | 'gain' | 'maintenance';
  preferences: 'none' | 'vegetarian' | 'vegan' | 'high_protein' | 'low_carb' | 'balanced';
  mealsStyle: 'indian' | 'international';
  weight: number;
  height: number;
  age: number;
}

export const DietAIService = {
  /**
   * Ask active AI provider to build meal plan
   */
  async generateDietPlan(userId: string, specs: DietGenerationSpecs): Promise<string> {
    const provider = await AIProviderService.getProvider(userId);

    const prompt = `Generate a detailed meal plan for a ${specs.age} year old with weight ${specs.weight}kg and height ${specs.height}cm.
Nutrition Goal: ${specs.dietGoal === 'loss' ? 'Weight Loss' : specs.dietGoal === 'gain' ? 'Muscle Gain' : 'Maintenance'}
Dietary Preferences: ${specs.preferences}
Meals Culinary Style: ${specs.mealsStyle}

Format as markdown. Include:
1. Daily calories & macronutrient grams target (protein, fat, carbs)
2. Water intake requirement
3. Menu suggestions (Breakfast, Lunch, Snacks, Dinner).`;

    const response = await provider.generateResponse(prompt);

    // Save recommendation record
    const payload = {
      user_id: userId,
      category: 'diet',
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
export default DietAIService;
