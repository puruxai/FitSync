import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService } from '../services/auth';
import { ProfileService } from '../services/profile';
import type { UserSession } from '../services/auth';
import type { UserProfile } from '../types';

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error: string | null }>;
  signup: (email: string, password: string, username: string, fullName: string) => Promise<{ success: boolean; error: string | null }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfileDetails: (details: Partial<UserProfile>) => Promise<{ success: boolean; error: string | null }>;
  signInWithGoogle: () => Promise<{ success: boolean; error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserSession>({ user: null, profile: null });
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const activeSession = await AuthService.getSession();
        if (activeSession) {
          setSession(activeSession);
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    const { data, error } = await AuthService.signIn(email, password);
    setIsLoading(false);
    if (error) {
      return { success: false, error: String(error) };
    }
    setSession(data);
    return { success: true, error: null };
  };

  const signup = async (email: string, password: string, username: string, fullName: string) => {
    setIsLoading(true);
    const { data, error } = await AuthService.signUp(email, password, username, fullName);
    setIsLoading(false);
    if (error) {
      return { success: false, error: String(error) };
    }
    setSession(data);
    return { success: true, error: null };
  };

  const logout = async () => {
    setIsLoading(true);
    const userId = session.user?.id;
    await AuthService.signOut(userId);
    setSession({ user: null, profile: null });
    setIsLoading(false);
  };

  const refreshProfile = async () => {
    const activeSession = await AuthService.getSession();
    if (activeSession) {
      setSession(activeSession);
    }
  };

  const updateProfileDetails = async (details: Partial<UserProfile>) => {
    if (!session.user?.id) return { success: false, error: 'No active session.' };
    
    try {
      const data = await ProfileService.updateProfile(session.user.id, details);
      setSession(prev => ({ ...prev, profile: data }));
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update profile details.' };
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    const { error } = await AuthService.signInWithGoogle();
    setIsLoading(false);
    if (error) {
      return { success: false, error: String(error) };
    }
    return { success: true, error: null };
  };

  return (
    <AuthContext.Provider
      value={{
        user: session.user,
        profile: session.profile,
        isLoading,
        login,
        signup,
        logout,
        refreshProfile,
        updateProfileDetails,
        signInWithGoogle
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
