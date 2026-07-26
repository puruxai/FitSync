// FitSync Hook: useFavoriteWorkouts
// Manages bookmarking workouts and reading the user's favorites catalog

import { useState, useEffect, useCallback } from 'react';
import { WorkoutService, type Workout } from '../services/workout';

export const useFavoriteWorkouts = (userId?: string) => {
  const [favorites, setFavorites] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFavs = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await WorkoutService.getFavorites(userId);
      setFavorites(data);
    } catch (err) {
      console.error('Failed to load favorites workouts:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchFavs();
  }, [fetchFavs]);

  const toggleFavorite = async (workoutId: string) => {
    if (!userId) return;
    const isFav = favorites.some(f => f.id === workoutId);
    try {
      await WorkoutService.toggleFavorite(userId, workoutId, !isFav);
      await fetchFavs();
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  const isFavorite = (workoutId: string) => {
    return favorites.some(f => f.id === workoutId);
  };

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorite,
    refetch: fetchFavs
  };
};

export default useFavoriteWorkouts;
