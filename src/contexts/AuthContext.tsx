'use client';

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { User, Session, AuthError, PostgrestError } from '@supabase/supabase-js';
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
  updateUserRole: (role: 'teacher' | 'parent') => Promise<{ error: AuthError | PostgrestError | string | null }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileCreating, setProfileCreating] = useState(false);

  const fetchProfile = useCallback(async (userId: string) => {
    // Prevent multiple simultaneous profile creation attempts
    if (profileCreating) {
      console.log('Profile creation already in progress, skipping...');
      return;
    }

    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          setProfileCreating(true);
          
          try {
            // Get current user to determine if this is OAuth or email user
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
              const isOAuthUser = user.app_metadata.provider === 'google';
              const userRole = isOAuthUser ? null : user.user_metadata.role;
              
              // Use upsert instead of insert to handle potential duplicates gracefully
              const { data: newProfile, error: insertError } = await supabase
                .from('profiles')
                .upsert([
                  {
                    id: userId,
                    full_name: user.user_metadata.full_name || user.user_metadata.name || '',
                    role: userRole, // OAuth users get null, email users get their role
                    email: user.email || undefined,
                    avatar_url: user.user_metadata.avatar_url || null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  },
                ], {
                  onConflict: 'id', // Handle conflicts on the primary key
                  ignoreDuplicates: false // Update if exists, insert if not
                })
                .select()
                .single();
              
              if (insertError) {
                console.error('Error creating/updating profile:', insertError);
                
                // If it's a duplicate key error, try to fetch the existing profile
                if (insertError.code === '23505') {
                  console.log('Profile already exists, fetching existing profile...');
                  const { data: existingProfile, error: fetchError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();
                  
                  if (fetchError) {
                    console.error('Error fetching existing profile:', fetchError);
                    setProfile(null);
                  } else if (existingProfile) {
                    const typedProfile: Profile = {
                      id: existingProfile.id,
                      full_name: existingProfile.full_name,
                      role: existingProfile.role as 'teacher' | 'parent' | null,
                      email: (existingProfile as { email?: string }).email, // Type assertion for email field
                      avatar_url: existingProfile.avatar_url,
                      created_at: existingProfile.created_at,
                      updated_at: existingProfile.updated_at,
                    };
                    setProfile(typedProfile);
                  }
                } else {
                  setProfile(null);
                }
              } else if (newProfile) {
                // Set the profile directly instead of calling fetchProfile again
                const typedProfile: Profile = {
                  id: newProfile.id,
                  full_name: newProfile.full_name,
                  role: newProfile.role as 'teacher' | 'parent' | null,
                  email: (newProfile as { email?: string }).email, // Type assertion for email field
                  avatar_url: newProfile.avatar_url,
                  created_at: newProfile.created_at,
                  updated_at: newProfile.updated_at,
                };
                setProfile(typedProfile);
              }
            }
          } finally {
            setProfileCreating(false);
          }
        } else {
          console.error('Profile fetch error (not PGRST116):', error);
          setProfile(null);
        }
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
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Error in profile fetch:', error);
      setProfile(null);
    }
  }, [profileCreating]);

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.warn('Auth loading timeout - forcing loading to false');
      setLoading(false);
    }, 10000); // 10 seconds timeout

    let isInitialized = false;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            await fetchProfile(session.user.id);
          } catch (error) {
            console.error('Error in auth state change:', error);
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
        
        // Only set loading to false after profile is processed
        if (!isInitialized) {
          isInitialized = true;
          setLoading(false);
        }
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
        
        // Set loading to false after initial session check and profile fetch
        if (!isInitialized) {
          isInitialized = true;
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        if (!isInitialized) {
          isInitialized = true;
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const updateUserRole = async (role: 'teacher' | 'parent') => {
    if (!user) return { error: 'No user found' };

    try {
      console.log('Updating user role to:', role);
      
      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { role: role }
      });

      if (metadataError) {
        console.error('Error updating user metadata:', metadataError);
        return { error: metadataError };
      }

      // Update profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: role })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        return { error: profileError };
      }

      // Refresh the profile
      await fetchProfile(user.id);
      
      console.log('User role updated successfully');
      return { error: null };
    } catch (error) {
      console.error('Error updating user role:', error);
      return { error: error as AuthError | string };
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
    console.log('Starting email signup process for:', email, 'with role:', role);
    
    // Create the user account
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role, // Store role in user metadata for email signups
        },
      },
    });

    if (error) {
      console.error('Signup error:', error);
      return { data, error };
    }

    console.log('User created successfully:', data.user?.id);

    // If signup was successful, send confirmation email
    if (data.user) {
      try {
        console.log('User created successfully, sending confirmation email');
        
        // Send confirmation email via Resend
        const response = await fetch('/api/send-confirmation-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          console.error('Failed to send confirmation email via Resend');
        } else {
          console.log('Confirmation email sent successfully via Resend');
        }
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
      }
    }

    return { data, error };
  };

  const signOut = async () => {
    try {
      // Clear local state immediately for instant UI response
      setUser(null);
      setSession(null);
      setProfile(null);
      setLoading(false);
      
      // Sign out from Supabase in background
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
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
      updateUserRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
};


