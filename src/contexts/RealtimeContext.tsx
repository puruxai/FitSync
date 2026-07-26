// FitSync Realtime Context Provider
// Aggregates real-time fitness values, friendship invites, notification logs, and offline network status

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { usePresence } from '../hooks/usePresence';
import { useRealtimeFitness } from '../hooks/useRealtimeFitness';
import { useRealtimeFriends } from '../hooks/useRealtimeFriends';
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';
import { FitnessService } from '../services/fitness';
import toast from 'react-hot-toast';

interface RealtimeContextType {
  liveSteps: number;
  liveCalories: number;
  liveWater: number;
  onlineFriends: string[];
  notifications: any[];
  isNetworkOnline: boolean;
  addLiveWater: (amountMl: number) => Promise<void>;
  addLiveSteps: (steps: number) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();

  // 1. Invocations of realtime sub-hooks
  const { isNetworkOnline } = usePresence(profile?.id);
  const { 
    steps: liveSteps, 
    calories: liveCalories, 
    water: liveWater, 
    setSteps: setLiveSteps, 
    setCalories: setLiveCalories, 
    setWater: setLiveWater 
  } = useRealtimeFitness(profile?.id);

  const { friends } = useRealtimeFriends(profile?.id);
  const { notifications, markAsRead, refetch: refreshNotifications } = useRealtimeNotifications(profile?.id);

  // Online friends presence mappings
  const [onlineFriendsList, setOnlineFriendsList] = useState<string[]>([]);

  useEffect(() => {
    // Collect friends who are online
    const list = friends.map(f => f.friend_id).filter(Boolean) as string[];
    setOnlineFriendsList(list);
  }, [friends]);

  // 2. Realtime Simulation Fallbacks (Simulates walk intervals when offline or in mock modes)
  useEffect(() => {
    if (!profile) return;

    // Simulate step tracker incrementing as user walks
    const stepsInterval = setInterval(async () => {
      // 30% chance to increment steps (simulates movement)
      if (Math.random() < 0.4) {
        const stepIncrement = Math.floor(Math.random() * 8) + 3; // 3 to 10 steps
        const calIncrement = Math.round(stepIncrement * 0.04);
        
        setLiveSteps(prev => {
          const nextSteps = prev + stepIncrement;
          setLiveCalories(c => {
            const nextCals = c + calIncrement;
            // Save steps to service
            FitnessService.logSteps(profile.id, nextSteps, nextCals).catch(() => {});
            return nextCals;
          });
          return nextSteps;
        });
      }
    }, 8000);

    return () => {
      clearInterval(stepsInterval);
    };
  }, [profile, setLiveSteps, setLiveCalories]);

  const addLiveWater = async (amountMl: number) => {
    if (!profile) return;
    const newTotal = liveWater + amountMl;
    setLiveWater(newTotal);
    await FitnessService.logWater(profile.id, newTotal);
    toast.success(`Added ${amountMl}ml of water!`, { icon: '💧' });
  };

  const addLiveSteps = async (steps: number) => {
    if (!profile) return;
    const newSteps = liveSteps + steps;
    const newCals = liveCalories + Math.round(steps * 0.04);
    setLiveSteps(newSteps);
    setLiveCalories(newCals);
    await FitnessService.logSteps(profile.id, newSteps, newCals);
    toast.success(`Logged ${steps} steps manually!`, { icon: '🏃' });
  };

  return (
    <RealtimeContext.Provider
      value={{
        liveSteps,
        liveCalories,
        liveWater,
        onlineFriends: onlineFriendsList,
        notifications,
        isNetworkOnline,
        addLiveWater,
        addLiveSteps,
        refreshNotifications,
        markAsRead
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};
export default useRealtime;
