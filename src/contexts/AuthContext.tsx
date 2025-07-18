'use client';

import React, { createContext, useState, useEffect } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  full_name: string;
  role: "parent" | "teacher" | null;
  email?: string;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthResponse {
  data: {
    user: User | null;
    session: Session | null;
  };
  error: AuthError | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string, fullName: string, role: 'teacher' | 'parent') => Promise<AuthResponse>;
  signOut: () => Promise<{ error: AuthError | null }>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
      } else if (profileData) {
        // Type assertion for the database response
        const dbProfile = profileData as {
          id: string;
          full_name: string;
          role: string;
          email?: string;
          avatar_url?: string | null;
          created_at: string;
          updated_at: string;
        };

        // Ensure all required fields are present
        const typedProfile: Profile = {
          id: dbProfile.id,
          full_name: dbProfile.full_name,
          role: dbProfile.role as 'teacher' | 'parent' | null,
          email: dbProfile.email,
          avatar_url: dbProfile.avatar_url,
          created_at: dbProfile.created_at,
          updated_at: dbProfile.updated_at,
        };
        setProfile(typedProfile);
      }
    } catch (error) {
      console.error('Error in profile fetch:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(async () => {
            await fetchProfile(session.user.id);
            // Check if profile exists
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            if (!profileData && !profileError) {
              // Create profile with role from user metadata
              await supabase.from('profiles').insert([
                {
                  id: session.user.id,
                  full_name: session.user.user_metadata.full_name || session.user.user_metadata.name || '',
                  role: session.user.user_metadata.role || undefined, // <-- set role from metadata
                  email: session.user.email || undefined,
                  avatar_url: null,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              ]);
              // Refetch profile after creation
              await fetchProfile(session.user.id);
            }
            setLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'teacher' | 'parent') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    return { data, error };
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear local state
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Return success to allow components to handle navigation
      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error: error as AuthError | null };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};


