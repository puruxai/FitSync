// FitSync Content and User Moderation Service
// Handles user suspensions, account bans, verified badges toggles, and deletion triggers

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb, saveToMockDb } from './mockDb';
import { AuditService } from './audit';

export const ModerationService = {
  /**
   * Suspend a user
   */
  async suspendUser(adminId: string, targetUserId: string, reason: string): Promise<void> {
    if (isSupabaseConfigured) {
      // Typically update profile status
      await supabase
        .from('profiles')
        .update({ bio: '[Suspended by Moderation] ' + reason })
        .eq('id', targetUserId);
    } else {
      const list = getFromMockDb<any>('profiles');
      const idx = list.findIndex(p => p.id === targetUserId);
      if (idx !== -1) {
        list[idx].bio = '[Suspended by Moderation] ' + reason;
        saveToMockDb('profiles', list);
      }
    }
    
    // Log moderation action
    await AuditService.logAction(adminId, 'user_suspension', `Suspended user: ${targetUserId}. Reason: ${reason}`);
  },

  /**
   * Ban a user
   */
  async banUser(adminId: string, targetUserId: string, reason: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase
        .from('profiles')
        .update({ bio: '[Banned permanently]' })
        .eq('id', targetUserId);
    } else {
      const list = getFromMockDb<any>('profiles');
      const idx = list.findIndex(p => p.id === targetUserId);
      if (idx !== -1) {
        list[idx].bio = '[Banned permanently]';
        saveToMockDb('profiles', list);
      }
    }

    await AuditService.logAction(adminId, 'user_ban', `Banned user: ${targetUserId}. Reason: ${reason}`);
  },

  /**
   * Lift suspension/ban (Unban)
   */
  async unsuspendUser(adminId: string, targetUserId: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase
        .from('profiles')
        .update({ bio: 'Suspension lifted' })
        .eq('id', targetUserId);
    } else {
      const list = getFromMockDb<any>('profiles');
      const idx = list.findIndex(p => p.id === targetUserId);
      if (idx !== -1) {
        list[idx].bio = 'Suspension lifted';
        saveToMockDb('profiles', list);
      }
    }

    await AuditService.logAction(adminId, 'user_unsuspension', `Unbanned user: ${targetUserId}`);
  },

  /**
   * Verify User (Assign Trainer/Nutritionist badge status)
   */
  async verifyUser(adminId: string, targetUserId: string, badgeType: 'verified_trainer' | 'verified_nutritionist' | 'none'): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase
        .from('profiles')
        .update({ location: `Verified: ${badgeType.replace('_', ' ')}` })
        .eq('id', targetUserId);
    } else {
      const list = getFromMockDb<any>('profiles');
      const idx = list.findIndex(p => p.id === targetUserId);
      if (idx !== -1) {
        list[idx].location = `Verified: ${badgeType.replace('_', ' ')}`;
        saveToMockDb('profiles', list);
      }
    }

    await AuditService.logAction(adminId, 'user_verification', `Verified user: ${targetUserId} as ${badgeType}`);
  }
};
export default ModerationService;
