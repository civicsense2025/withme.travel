'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient, User, Session } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { TABLES, FIELDS } from '../utils/constants/database';

// Ensure environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Type for the extended user that includes profile data
export interface ExtendedUser extends User {
  profile?: {
    name: string | null;
    avatar_url: string | null;
    username: string | null;
    email?: string | null;
  };
}

// Type for the user profile from the database
export interface UserProfile {
  id: string;
  name: string | null;
  avatar_url: string | null;
  username: string | null;
  email: string | null;
}

function getProfileName(profile: UserProfile | null, fallback: string): string {
  return profile?.name || fallback;
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
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from(TABLES.PROFILES)
        .select([
          FIELDS.PROFILES.ID,
          FIELDS.PROFILES.NAME,
          FIELDS.PROFILES.AVATAR_URL,
          FIELDS.PROFILES.USERNAME,
          FIELDS.PROFILES.EMAIL,
        ].join(','))
        .eq(FIELDS.PROFILES.ID, userId)
        .maybeSingle();
      if (error) {
        console.error('[Auth] Error fetching profile:', error);
        return null;
      }
      if (!data || typeof data !== 'object' || typeof (data as any).id !== 'string') {
        return null;
      }
      return data as unknown as UserProfile;
    } catch (err) {
      console.error('[Auth] Exception fetching profile:', err);
      return null;
    }
  };

  // Initialize the auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('[Auth] Initializing auth state...');
        if (!supabase.auth) throw new Error('Supabase client not properly initialized');
        const {
          data: { session: currentSession },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (currentSession) {
          setSession(currentSession);
          setUser({
            ...currentSession.user,
            profile: await fetchUserProfile(currentSession.user.id) || {
              id: currentSession.user.id,
              name: null,
              avatar_url: null,
              username: null,
              email: currentSession.user.email ?? null,
            },
          });
          setIsLoading(false);
          return;
        } else {
          console.log('[Auth] No active session found');
        }
      } catch (error) {
        console.error('[Auth] Error initializing auth:', error);
        setInitializationError(error instanceof Error ? error : new Error('Unknown auth error'));
      } finally {
        setIsLoading(false);
      }
    };
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
                        name: getProfileName(profile, prev.email || 'User'),
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
      
      // First attempt - standard refresh
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('[Auth] Error refreshing session:', error);
        
        // Second attempt - get session directly
        console.log('[Auth] Attempting to get session directly...');
        const sessionResult = await supabase.auth.getSession();
        
        if (sessionResult.error) {
          console.error('[Auth] Failed to get session directly:', sessionResult.error);
          throw new Error('Session refresh failed after multiple attempts');
        }
        
        if (sessionResult.data.session) {
          console.log('[Auth] Successfully retrieved session');
          setSession(sessionResult.data.session);
          setUser((sessionResult.data.session?.user as ExtendedUser) || null);
          
          // Get user profile data
          if (sessionResult.data.session?.user) {
            const profile = await fetchUserProfile(sessionResult.data.session.user.id);
            if (profile) {
              setUser((prev) =>
                prev
                  ? {
                      ...prev,
                      profile: {
                        name: getProfileName(profile, prev.email || 'User'),
                        avatar_url: profile.avatar_url,
                        username: profile.username,
                      },
                    }
                  : null
              );
            }
          }
          return;
        }
      } else {
        // Successful refresh
        setSession(data.session);
        setUser((data.session?.user as ExtendedUser) || null);
        
        // Get user profile data on successful refresh
        if (data.session?.user) {
          const profile = await fetchUserProfile(data.session.user.id);
          if (profile) {
            setUser((prev) =>
              prev
                ? {
                    ...prev,
                    profile: {
                      name: getProfileName(profile, prev.email || 'User'),
                      avatar_url: profile.avatar_url,
                      username: profile.username,
                    },
                  }
                : null
            );
          }
        }
        
        console.log('[Auth] Session refreshed successfully');
        return;
      }
      
      // If we reach here, both attempts failed but didn't throw errors
      throw new Error('Failed to refresh session');
      
    } catch (error) {
      console.error('[Auth] Critical error refreshing session:', error);
      
      // Clear session state to avoid showing stale data
      setSession(null);
      setUser(null);
      
      // Force page reload as a last resort (browser will try to recover cookies)
      setTimeout(() => {
        console.log('[Auth] Forcing page reload to recover session');
        window.location.reload();
      }, 500);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Add the periodic session check effect here, after refreshSession is defined
  // Set up a periodic session check to detect and fix stale sessions
  useEffect(() => {
    if (!supabase.auth) return;
    
    // Function to check session health
    const checkSessionHealth = async () => {
      try {
        // Skip if already refreshing or we don't have a session
        if (isRefreshing || !session) return;
        
        // Check if our session is still valid
        const {
          data: { session: currentSession },
          error: sessionError,
        } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[Auth] Error checking session health:', sessionError);
          // Session check failed - force a refresh
          refreshSession();
          return;
        }
        
        // If we think we have a session but the server says no, trigger a refresh
        if (session && !currentSession) {
          console.log('[Auth] Session mismatch detected - local session exists but server has none');
          refreshSession();
          return;
        }
        
        // If token expiry is coming up (less than 5 minutes away), refresh proactively
        if (currentSession) {
          const expiresAt = new Date((currentSession.expires_at || 0) * 1000);
          const now = new Date();
          const timeUntilExpiry = expiresAt.getTime() - now.getTime();
          
          if (timeUntilExpiry < 5 * 60 * 1000) { // Less than 5 minutes
            console.log('[Auth] Session expiring soon, refreshing proactively');
            refreshSession();
          }
        }
      } catch (error) {
        console.error('[Auth] Session health check failed:', error);
      }
    };
    
    // Check immediately after the component mounts
    checkSessionHealth();
    
    // Set up recurring checks (every 2 minutes)
    const intervalId = setInterval(checkSessionHealth, 2 * 60 * 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [supabase, session, isRefreshing, refreshSession]);

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
