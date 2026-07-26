// FitSync Score Calculator Service
// Computes weighted fitness activity score based on metrics inputs (steps, water, workouts)

export const ScoreCalculatorService = {
  // Configurable weights
  weights: {
    steps: 0.05,
    calories: 0.1,
    workoutMinutes: 2.0,
    waterMl: 0.1
  },

  /**
   * Calculate aggregate activity score
   */
  calculateActivityScore(metrics: {
    steps: number;
    calories: number;
    workoutMinutes: number;
    waterMl: number;
  }): number {
    return Math.round(
      metrics.steps * this.weights.steps +
      metrics.calories * this.weights.calories +
      metrics.workoutMinutes * this.weights.workoutMinutes +
      metrics.waterMl * this.weights.waterMl
    );
  }
};
