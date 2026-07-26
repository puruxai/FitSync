// FitSync Challenge Invite Service (Dual Mode: Supabase or Local Mock Fallback)
// Handles sending and accepting/rejecting invitations for challenges

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb, saveToMockDb } from './mockDb';
import { ChallengeService } from './challenge';

export interface ChallengeInvite {
  id: string;
  challenge_id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  challenge?: any;
  sender?: any;
}

export const ChallengeInviteService = {
  /**
   * Send invite
   */
  async sendInvite(challengeId: string, senderId: string, receiverId: string): Promise<ChallengeInvite> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('challenge_invites')
        .insert({
          challenge_id: challengeId,
          sender_id: senderId,
          receiver_id: receiverId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data as unknown as ChallengeInvite;
    } else {
      const invites = getFromMockDb<ChallengeInvite>('challenge_invites');
      const exists = invites.some(i => i.challenge_id === challengeId && i.sender_id === senderId && i.receiver_id === receiverId);
      if (exists) throw new Error('Invite already sent');

      const newInvite: ChallengeInvite = {
        id: 'cinv-' + Math.random().toString(36).substr(2, 9),
        challenge_id: challengeId,
        sender_id: senderId,
        receiver_id: receiverId,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      invites.push(newInvite);
      saveToMockDb('challenge_invites', invites);
      return newInvite;
    }
  },

  /**
   * Accept invite
   */
  async acceptInvite(inviteId: string, userId: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { data, error: inviteError } = await supabase
        .from('challenge_invites')
        .update({ status: 'accepted' })
        .eq('id', inviteId)
        .select()
        .single();

      if (inviteError) throw inviteError;
      
      // Auto join
      await ChallengeService.joinChallenge(data.challenge_id, userId);
    } else {
      const invites = getFromMockDb<ChallengeInvite>('challenge_invites');
      const idx = invites.findIndex(i => i.id === inviteId);
      if (idx !== -1) {
        invites[idx].status = 'accepted';
        saveToMockDb('challenge_invites', invites);
        await ChallengeService.joinChallenge(invites[idx].challenge_id, userId);
      }
    }
  },

  /**
   * Reject invite
   */
  async rejectInvite(inviteId: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase
        .from('challenge_invites')
        .update({ status: 'rejected' })
        .eq('id', inviteId);
    } else {
      const invites = getFromMockDb<ChallengeInvite>('challenge_invites');
      const idx = invites.findIndex(i => i.id === inviteId);
      if (idx !== -1) {
        invites[idx].status = 'rejected';
        saveToMockDb('challenge_invites', invites);
      }
    }
  },

  /**
   * Get invites for a user
   */
  async getInvites(userId: string): Promise<ChallengeInvite[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('challenge_invites')
        .select('*, challenge:challenges(*), sender:profiles!challenge_invites_sender_id_fkey(*)')
        .eq('receiver_id', userId)
        .eq('status', 'pending');

      if (error) throw error;
      return (data as unknown as ChallengeInvite[]) || [];
    } else {
      const invites = getFromMockDb<ChallengeInvite>('challenge_invites');
      const challenges = getFromMockDb<any>('challenges');
      const profiles = getFromMockDb<any>('profiles');

      return invites
        .filter(i => i.receiver_id === userId && i.status === 'pending')
        .map(i => ({
          ...i,
          challenge: challenges.find((c: any) => c.id === i.challenge_id),
          sender: profiles.find((p: any) => p.id === i.sender_id)
        }));
    }
  }
};
