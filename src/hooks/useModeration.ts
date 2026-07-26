// FitSync Hook: useModeration
// Triggers suspensions, bans, unbans, and verification badges updates

import { useState } from 'react';
import { ModerationService } from '../services/moderation';

export const useModeration = (adminId?: string) => {
  const [loading, setLoading] = useState(false);

  const suspendUser = async (targetUserId: string, reason: string) => {
    if (!adminId) return;
    try {
      setLoading(true);
      await ModerationService.suspendUser(adminId, targetUserId, reason);
    } finally {
      setLoading(false);
    }
  };

  const banUser = async (targetUserId: string, reason: string) => {
    if (!adminId) return;
    try {
      setLoading(true);
      await ModerationService.banUser(adminId, targetUserId, reason);
    } finally {
      setLoading(false);
    }
  };

  const liftSuspension = async (targetUserId: string) => {
    if (!adminId) return;
    try {
      setLoading(true);
      await ModerationService.unsuspendUser(adminId, targetUserId);
    } finally {
      setLoading(false);
    }
  };

  const verifyUser = async (targetUserId: string, badgeType: 'verified_trainer' | 'verified_nutritionist' | 'none') => {
    if (!adminId) return;
    try {
      setLoading(true);
      await ModerationService.verifyUser(adminId, targetUserId, badgeType);
    } finally {
      setLoading(false);
    }
  };

  return {
    suspendUser,
    banUser,
    liftSuspension,
    verifyUser,
    loading
  };
};

export default useModeration;
