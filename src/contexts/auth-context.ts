'use client';

import React from 'react';
import { User, Session } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  full_name: string;
  role: "parent" | "teacher" | null;
  email?: string;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbProfile {
  id: string;
  full_name: string;
  role: string | null;
  email?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  data: {
    user: User | null;
    session: Session | null;
  };
  error: Error | null;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string, fullName: string, role: 'teacher' | 'parent') => Promise<AuthResponse>;
  signOut: () => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  updateUserRole: (role: 'teacher' | 'parent') => Promise<{ error: string | null }>;
  clearError: () => void;
}

export const mapDbProfileToProfile = (dbProfile: DbProfile): Profile => {
  return {
    id: dbProfile.id,
    full_name: dbProfile.full_name || '',
    role: dbProfile.role as 'teacher' | 'parent' | null,
    email: dbProfile.email || undefined,
    avatar_url: dbProfile.avatar_url,
    created_at: dbProfile.created_at,
    updated_at: dbProfile.updated_at,
  };
};

export const AuthContext = React.createContext<AuthContextType | undefined>(undefined);