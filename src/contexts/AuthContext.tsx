/**
 * AuthProvider - Authentication and user profile management
 * 
 * Note: Context has been moved to separate file to fix Fast Refresh warning
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContext, Profile, mapDbProfileToProfile, AuthResponse } from './auth-context';

// ============================================================================
// Context Provider
// ============================================================================

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Ref to track if component is mounted (prevent memory leaks)
  const isMountedRef = useRef(true);
  const initializingRef = useRef(false);

  const fetchProfile = useCallback(async (userId: string, signal?: AbortSignal) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors when not found

      if (signal?.aborted) return;

      if (profileError) {
        throw profileError;
      }

      if (profileData) {
        const mappedProfile = mapDbProfileToProfile(profileData);
        if (isMountedRef.current) {
          setProfile(mappedProfile);
          setError(null);
        }
      } else {
        if (isMountedRef.current) {
          setProfile(null);
        }
      }
    } catch (err) {
      if (!signal?.aborted && isMountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
        setError(errorMessage);
        setProfile(null);
      }
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);


  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setError(null);
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
      }

      return { data, error: signInError };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign in failed';
      setError(errorMessage);
      return {
        data: { user: null, session: null },
        error: err as AuthError,
      };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: 'teacher' | 'parent'
  ): Promise<AuthResponse> => {
    try {
      setError(null);
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return { data, error: signUpError };
      }

      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed';
      setError(errorMessage);
      return {
        data: { user: null, session: null },
        error: err as AuthError,
      };
    }
  };

  const signOut = async (): Promise<{ error: AuthError | null }> => {
    try {
      setError(null);
      
      // Clear local state first for immediate UI response
      if (isMountedRef.current) {
        setUser(null);
        setSession(null);
        setProfile(null);
      }

      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        setError(signOutError.message);
        return { error: signOutError };
      }

      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign out failed';
      setError(errorMessage);
      return { error: err as AuthError };
    }
  };

  const updateUserRole = async (role: 'teacher' | 'parent'): Promise<{ error: string | null }> => {
    if (!user) {
      const errorMsg = 'No authenticated user found';
      setError(errorMsg);
      return { error: errorMsg };
    }

    try {
      setError(null);

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Update local state optimistically
      if (profile && isMountedRef.current) {
        setProfile({ ...profile, role });
      }

      // Optionally update user metadata for non-OAuth users
      const isOAuthUser = user.app_metadata?.provider !== 'email';
      if (!isOAuthUser) {
        // Fire and forget - don't wait for this
        supabase.auth.updateUser({ data: { role } });
      }

      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update role';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    const abortController = new AbortController();

    // Local function to fetch profile (avoids dependency issues)
    const fetchProfileLocal = async (userId: string, signal?: AbortSignal) => {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (signal?.aborted) return;

        if (profileError) {
          throw profileError;
        }

        if (profileData) {
          const mappedProfile = mapDbProfileToProfile(profileData);
          if (isMountedRef.current) {
            setProfile(mappedProfile);
            setError(null);
          }
        } else {
          if (isMountedRef.current) {
            setProfile(null);
          }
        }
      } catch (err) {
        if (!signal?.aborted && isMountedRef.current) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
          setError(errorMessage);
          setProfile(null);
        }
      }
    };

    const initializeAuth = async () => {
      // Prevent multiple simultaneous initializations
      if (initializingRef.current) return;
      initializingRef.current = true;

      try {
        const { data: { session: currentSession }, error: sessionError } = 
          await supabase.auth.getSession();

        if (abortController.signal.aborted || !isMountedRef.current) return;

        if (sessionError) {
          setError(sessionError.message);
        }

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await fetchProfileLocal(currentSession.user.id, abortController.signal);
        }
      } catch (err) {
        if (!abortController.signal.aborted && isMountedRef.current) {
          const errorMessage = err instanceof Error ? err.message : 'Auth initialization failed';
          setError(errorMessage);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
          initializingRef.current = false;
        }
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        if (!isMountedRef.current) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await fetchProfileLocal(currentSession.user.id, abortController.signal);
        } else {
          setProfile(null);
        }

        // Ensure loading is set to false after auth state changes
        setLoading(false);
      }
    );

    initializeAuth();

    return () => {
      isMountedRef.current = false;
      abortController.abort();
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        error,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        updateUserRole,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};