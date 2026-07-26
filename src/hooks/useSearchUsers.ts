// FitSync Hook: useSearchUsers
// Coordinates live debounced profiles searching, active suggestions, and history logs

import { useState, useEffect, useCallback } from 'react';
import { SearchService } from '../services/search';
import type { UserProfile } from '../types';

export const useSearchUsers = (currentUserId?: string) => {
  const [results, setResults] = useState<UserProfile[]>([]);
  const [suggestions, setSuggestions] = useState<UserProfile[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Load suggestions & search history initially
  const loadSearchMeta = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const [suggs, recents] = await Promise.all([
        SearchService.getSearchSuggestions(currentUserId),
        SearchService.getRecentSearches(currentUserId)
      ]);
      setSuggestions(suggs);
      setRecentSearches(recents);
    } catch (err) {
      console.error('Failed to load search metadata:', err);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadSearchMeta();
  }, [loadSearchMeta]);

  // Debounced search trigger
  const search = useCallback(async (query: string) => {
    if (!currentUserId) return;
    const clean = query.trim();
    if (!clean) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const data = await SearchService.searchUsers(currentUserId, clean);
      setResults(data);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  const saveSearchHistory = async (query: string) => {
    if (!currentUserId || !query.trim()) return;
    try {
      await SearchService.saveRecentSearch(currentUserId, query);
      const recents = await SearchService.getRecentSearches(currentUserId);
      setRecentSearches(recents);
    } catch {}
  };

  const clearHistory = async () => {
    if (!currentUserId) return;
    try {
      await SearchService.clearRecentSearches(currentUserId);
      setRecentSearches([]);
    } catch {}
  };

  return {
    results,
    suggestions,
    recentSearches,
    loading,
    search,
    saveSearchHistory,
    clearHistory,
    refetchMeta: loadSearchMeta
  };
};

export default useSearchUsers;
