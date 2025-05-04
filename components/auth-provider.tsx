'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient, User, Session } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// Ensure environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Type for the extended user that includes profile data
export interface ExtendedUser extends User {
  profile?: {
    name: string;
    avatar_url: string | null;
    username: string | null;
  };
}

// Auth context interface
export interface AuthContextType {
  user: ExtendedUser | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, metadata?: any) => Promise<void>;
  refreshSession: () => Promise<void>;
  supabase: SupabaseClient<Database>;
}

// Create the auth context with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
  signUp: async () => {},
  refreshSession: async () => {},
  supabase: {} as SupabaseClient<Database>,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Create the Supabase client safely
  const [supabase] = useState(() => {
    try {
      return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
    } catch (error) {
      console.error('Failed to create Supabase client:', error);
      // Return a placeholder to prevent errors, though auth won't work
      return {} as SupabaseClient<Database>;
    }
  });
  
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [initializationError, setInitializationError] = useState<Error | null>(null);

  // Function to fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return profile;
    } catch (err) {
      console.error('Exception fetching profile:', err);
      return null;
    }
  };

  // Initialize the auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('[Auth] Initializing auth state...');
        
        // Make sure supabase client is valid
        if (!supabase.auth) {
          throw new Error('Supabase client not properly initialized');
        }

        // Get the current session
        const {
          data: { session: currentSession },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (currentSession) {
          console.log('[Auth] Session found, user ID:', currentSession.user.id);
          setSession(currentSession);
          setUser(currentSession.user as ExtendedUser);

          // Fetch user profile data if session exists
          const profile = await fetchUserProfile(currentSession.user.id);
          
          if (profile) {
            console.log('[Auth] Profile found for user');
            setUser((prev) =>
              prev
                ? {
                    ...prev,
                    profile: {
                      name: profile.name || profile.full_name || '',
                      avatar_url: profile.avatar_url,
                      username: profile.username,
                    },
                  }
                : null
            );
          } else {
            console.log('[Auth] No profile found for user');
          }
        } else {
          console.log('[Auth] No active session found');
        }
      } catch (error) {
        console.error('[Auth] Error initializing auth:', error);
        setInitializationError(error instanceof Error ? error : new Error('Unknown auth error'));
      } finally {
        console.log('[Auth] Auth initialization complete');
        setIsLoading(false);
      }
    };

    // Only run initialization if supabase client is valid
    if (supabase.auth) {
      initializeAuth();
    } else {
      console.error('[Auth] Cannot initialize auth - Supabase client is invalid');
      setIsLoading(false);
      setInitializationError(new Error('Supabase client not initialized'));
    }

    // Set up auth state change listener
    let authListener: { data?: { subscription: { unsubscribe: () => void } }; subscription?: { unsubscribe: () => void } } = {
      subscription: { unsubscribe: () => {} }
    };
    
    if (supabase.auth) {
      const { data } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        console.log('[Auth] Auth state changed:', event);

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setSession(newSession);
          setUser((newSession?.user as ExtendedUser) || null);

          // Fetch user profile on sign in
          if (newSession?.user) {
            const profile = await fetchUserProfile(newSession.user.id);
            
            if (profile) {
              setUser((prev) =>
                prev
                  ? {
                      ...prev,
                      profile: {
                        name: profile.name || profile.full_name || '',
                        avatar_url: profile.avatar_url,
                        username: profile.username,
                      },
                    }
                  : null
              );
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
        }
      });
      
      authListener = { data };
    }

    return () => {
      if (authListener.data) {
        authListener.data.subscription.unsubscribe();
      } else if (authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [supabase]);

  // Authentication methods
  const signIn = async (email: string, password: string) => {
    if (!supabase.auth) {
      throw new Error('Authentication system not available');
    }
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    if (!supabase.auth) {
      throw new Error('Authentication system not available');
    }
    
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    if (!supabase.auth) {
      throw new Error('Authentication system not available');
    }
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    if (error) throw error;
  };

  const refreshSession = async () => {
    if (isRefreshing || !supabase.auth) return;

    try {
      setIsRefreshing(true);
      console.log('[Auth] Refreshing session...');
      
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;

      setSession(data.session);
      setUser((data.session?.user as ExtendedUser) || null);
      console.log('[Auth] Session refreshed successfully');
    } catch (error) {
      console.error('[Auth] Error refreshing session:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signIn,
        signOut,
        signUp,
        refreshSession,
        supabase,
      }}
    >
      {initializationError && process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-0 left-0 right-0 bg-red-600 text-white p-2 text-sm z-50">
          Auth error: {initializationError.message}
          <button 
            className="ml-2 underline"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
}
