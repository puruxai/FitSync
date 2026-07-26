// FitSync Role and RBAC Service
// Handles fetching user roles and permissions, checking access rights, and assigning roles

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb, saveToMockDb } from './mockDb';

export interface UserRoleMapping {
  user_id: string;
  role_id: string;
  role_name?: string;
}

export const RoleService = {
  /**
   * Get user roles
   */
  async getUserRoles(userId: string): Promise<string[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', userId);

      if (error) throw error;
      return (data as any[]).map(d => d.roles?.name).filter(Boolean);
    } else {
      const mappings = getFromMockDb<UserRoleMapping>('user_roles');
      const filtered = mappings.filter(m => m.user_id === userId);
      if (filtered.length === 0) {
        // Seed user role for mock
        return ['user'];
      }
      return filtered.map(m => m.role_name || 'user');
    }
  },

  /**
   * Assign role to user
   */
  async assignRole(userId: string, roleName: string): Promise<void> {
    if (isSupabaseConfigured) {
      // Find role id first
      const { data: role } = await supabase
        .from('roles')
        .select('id')
        .eq('name', roleName)
        .single();
      if (!role) throw new Error('Role not found');

      // Check if already assigned
      const { data: existing } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role_id', role.id)
        .maybeSingle();

      if (!existing) {
        await supabase
          .from('user_roles')
          .insert({ user_id: userId, role_id: role.id });
      }
    } else {
      const mappings = getFromMockDb<UserRoleMapping>('user_roles');
      const idx = mappings.findIndex(m => m.user_id === userId);
      if (idx !== -1) {
        mappings[idx].role_name = roleName;
      } else {
        mappings.push({
          user_id: userId,
          role_id: 'role-' + roleName,
          role_name: roleName
        });
      }
      saveToMockDb('user_roles', mappings);
    }
  },

  /**
   * Remove role from user
   */
  async removeRole(userId: string, _roleName: string): Promise<void> {
    if (isSupabaseConfigured) {
      // In supabse simple: clear user roles
      await supabase.from('user_roles').delete().eq('user_id', userId);
    } else {
      const mappings = getFromMockDb<UserRoleMapping>('user_roles');
      const filtered = mappings.filter(m => m.user_id !== userId);
      saveToMockDb('user_roles', filtered);
    }
  },

  /**
   * Check if user is Admin
   */
  async isAdmin(userId: string): Promise<boolean> {
    const roles = await this.getUserRoles(userId);
    return roles.includes('admin') || roles.includes('super_admin');
  },

  /**
   * Check if user is Moderator
   */
  async isModerator(userId: string): Promise<boolean> {
    const roles = await this.getUserRoles(userId);
    return roles.includes('moderator') || roles.includes('admin') || roles.includes('super_admin');
  }
};
export default RoleService;
