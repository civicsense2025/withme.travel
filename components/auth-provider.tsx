'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import type { User, Session, SupabaseClient } from '@supabase/supabase-js';
import { TABLES } from '@/utils/constants/database';

// Define a more complete type for TABLES that includes missing properties
type ExtendedTables = {
  TRIP_MEMBERS: string;
  TRIPS: string;
  USERS: string;
  ITINERARY_ITEMS: string;
  ITINERARY_SECTIONS: string;
  [key: string]: string;
};

// Use the extended type with the existing TABLES constant
const Tables = TABLES as unknown as ExtendedTables;

import { Database } from '@/types/database.types';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

// User profile type from database
export type UserProfile = Database['public']['Tables']['profiles']['Row'];

// Enhanced user type with profile data
export type AppUser = User & {
  profile: UserProfile | null;
};

// State interface for auth context
export interface AuthState {
  session: Session | null;
  user: AppUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
}

// Initial auth state
const initialAuthState: AuthState = {
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  error: null,
};

// Helper to create AppUser with profile
function createAppUser(user: User, profile: UserProfile | null): AppUser {
  return {
    ...user,
    profile,
  };
}

// Auth context type definition
export interface AuthContextType extends AuthState {
  supabase: SupabaseClient<Database> | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  refreshAuth: () => Promise<void>;
}

// Create default context
const defaultContext: AuthContextType = {
  ...initialAuthState,
  supabase: null,
  signIn: async () => {
    console.warn('AuthContext not initialized: signIn called');
  },
  signUp: async () => {
    console.warn('AuthContext not initialized: signUp called');
  },
  signOut: async () => {
    console.warn('AuthContext not initialized: signOut called');
  },
  clearError: () => {
    console.warn('AuthContext not initialized: clearError called');
  },
  refreshAuth: async () => {
    console.warn('AuthContext not initialized: refreshAuth called');
  },
};

// Export context
export const AuthContext = createContext<AuthContextType>(defaultContext);

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const mounted = useRef(true);
  const initialized = useRef(false);

  // State
  const [state, setState] = useState<AuthState>(initialAuthState);

  // Create supabase client for browser - simplified to reduce chunking issues
  const supabase = useMemo(() => {
    if (typeof window === 'undefined') return null;

    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!url || !key) {
        console.error('[AuthProvider] Missing Supabase environment variables');
        return null;
      }

      console.log('[AuthProvider] Creating browser client with @supabase/ssr');

      // Use createBrowserClient from @supabase/ssr with minimal options
      // to avoid type conflicts
      return createBrowserClient<Database>(url, key, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      });
    } catch (error) {
      console.error('[AuthProvider] Failed to create Supabase client:', error);
      return null;
    }
  }, []);

  // Helper functions
  const setIsLoading = useCallback((loading: boolean) => {
    if (mounted.current) {
      setState((prev) => ({ ...prev, isLoading: loading }));
    }
  }, []);

  const setError = useCallback((error: Error) => {
    if (mounted.current) {
      setState((prev) => ({ ...prev, error }));
      toast.error(error.message);
    }
  }, []);

  const clearError = useCallback(() => {
    if (mounted.current) {
      setState((prev) => ({ ...prev, error: null }));
    }
  }, []);

  // Fetch profile data
  const fetchProfile = useCallback(
    async (user: User) => {
      if (!supabase) throw new Error('Supabase client not initialized');

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        if (!profile) throw new Error('User profile not found');

        return profile as UserProfile;
      } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
    },
    [supabase]
  );

  // Update session state
  const updateSessionState = useCallback(
    async (session: Session | null) => {
      try {
        if (!session) {
          setState({
            ...initialAuthState,
            isLoading: false,
          });
          return;
        }

        // If session exists, fetch profile
        const profile = session.user ? await fetchProfile(session.user) : null;
        const user = profile ? createAppUser(session.user, profile) : null;

        setState({
          session,
          user,
          profile,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error updating session state:', error);
        setError(error instanceof Error ? error : new Error('Failed to update session'));
        setState((prev) => ({
          ...prev,
          isLoading: false,
        }));
      }
    },
    [fetchProfile, setError]
  );

  // Auth methods implementation
  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!supabase) {
        throw new Error('Authentication client not initialized');
      }

      setIsLoading(true);
      clearError();

      try {
        console.log('[AuthProvider] Attempting sign in for:', email);

        // First verify supabase client is properly initialized
        if (!supabase.auth || typeof supabase.auth.signInWithPassword !== 'function') {
          throw new Error('Supabase auth client is not properly initialized');
        }

        // Attempt sign in with better error handling
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) {
          console.error('[AuthProvider] Sign in error:', error.message, error);
          throw error;
        }

        if (!data.session) {
          console.error('[AuthProvider] No session returned after sign in');
          throw new Error('No session returned after sign in');
        }

        console.log('[AuthProvider] Sign in successful, updating session state');
        await updateSessionState(data.session);

        // Trigger a browser refresh of the Supabase client after successful login
        // This helps ensure client and server are in sync
        if (typeof window !== 'undefined') {
          const refreshEvent = new CustomEvent('supabase:auth:refresh');
          window.dispatchEvent(refreshEvent);
        }
      } catch (error) {
        console.error('[AuthProvider] Sign in error:', error);

        // Format the error message to be more user-friendly
        let errorMessage = 'Sign in failed';

        if (error instanceof Error) {
          if (error.message.includes('Invalid login credentials')) {
            errorMessage = 'Invalid email or password';
          } else if (error.message.includes('Rate limit')) {
            errorMessage = 'Too many sign in attempts. Please try again later.';
          } else {
            errorMessage = error.message;
          }
        }

        setError(error instanceof Error ? new Error(errorMessage) : new Error('Sign in failed'));
        setState((prev) => ({
          ...prev,
          session: null,
          user: null,
          profile: null,
        }));
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, setIsLoading, clearError, updateSessionState, setError]
  );

  // Other methods similar, simplified for brevity
  const signUp = useCallback(
    async (email: string, password: string) => {
      if (!supabase) throw new Error('Authentication client not initialized');

      setIsLoading(true);
      clearError();

      try {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        if (data.session) {
          await updateSessionState(data.session);
        } else {
          setIsLoading(false);
          toast.success('Please check your email to confirm your account');
        }
      } catch (error) {
        console.error('Sign up error:', error);
        setError(error instanceof Error ? error : new Error('Sign up failed'));
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, setIsLoading, clearError, updateSessionState, setError]
  );

  const signOut = useCallback(async () => {
    if (!supabase) throw new Error('Authentication client not initialized');

    setIsLoading(true);
    clearError();

    try {
      // Use scope: 'global' to ensure all devices get signed out
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;

      // Also call the API route to ensure cookies are properly cleared
      try {
        const response = await fetch('/api/auth/clear-cookies');
        if (!response.ok) {
          console.warn(
            '[AuthProvider] Cookie clearing API call failed, but continuing with sign out'
          );
        }
      } catch (cookieError) {
        console.error('[AuthProvider] Error calling cookie clear API:', cookieError);
        // Continue even if this fails
      }

      console.log('[AuthProvider] User signed out successfully');

      setState({
        ...initialAuthState,
        isLoading: false,
      });

      // Show toast with countdown and redirect after 3 seconds
      const redirectToHome = () => {
        window.location.href = '/';
      };

      toast.success("You're now logged out. Redirecting to homepage in 3 seconds...", {
        duration: 3000,
        onAutoClose: redirectToHome,
      });

      // Force a page refresh to ensure all state is cleared
      setTimeout(() => {
        redirectToHome();
      }, 3000);
    } catch (error) {
      console.error('[AuthProvider] Sign out error:', error);
      setError(error instanceof Error ? error : new Error('Sign out failed'));
    } finally {
      setIsLoading(false);
    }
  }, [supabase, setIsLoading, clearError, setError]);

  // Add refresh auth function
  const refreshAuth = useCallback(async () => {
    if (!supabase) {
      throw new Error('Authentication client not initialized');
    }

    setIsLoading(true);
    clearError();

    try {
      console.log('[AuthProvider] Refreshing auth state');
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error('[AuthProvider] Session refresh error:', error);
        throw error;
      }

      await updateSessionState(data.session);
      console.log('[AuthProvider] Auth state refreshed successfully');
    } catch (error) {
      console.error('[AuthProvider] Auth refresh error:', error);
      setError(error instanceof Error ? error : new Error('Failed to refresh authentication'));
    } finally {
      setIsLoading(false);
    }
  }, [supabase, clearError, updateSessionState, setError, setIsLoading]);

  // Initialize the client and auth state
  useEffect(() => {
    mounted.current = true;

    // Check if supabase client is available
    if (!supabase) {
      console.error('[AuthProvider] No Supabase client available. Authentication will not work.');
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: new Error('Authentication service unavailable'),
      }));
      return;
    }

    const initialize = async () => {
      try {
        console.log('[AuthProvider] Initializing auth state');

        // Only attempt to get session if client is available
        if (!supabase) {
          throw new Error('Supabase client not initialized');
        }

        // Get current session
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[AuthProvider] Error getting session:', error);
          throw error;
        }

        initialized.current = true;

        // Update state based on session
        if (data.session) {
          console.log('[AuthProvider] Session found, fetching profile data');
          try {
            const profile = await fetchProfile(data.session.user);
            if (mounted.current) {
              setState({
                session: data.session,
                user: createAppUser(data.session.user, profile),
                profile,
                isLoading: false,
                error: null,
              });
            }
          } catch (profileError) {
            console.error('[AuthProvider] Error fetching profile:', profileError);
            if (mounted.current) {
              setState({
                session: data.session,
                user: createAppUser(data.session.user, null),
                profile: null,
                isLoading: false,
                error:
                  profileError instanceof Error
                    ? profileError
                    : new Error('Failed to fetch profile'),
              });
            }
          }
        } else {
          console.log('[AuthProvider] No session found, user is not authenticated');
          if (mounted.current) {
            setState({
              ...initialAuthState,
              isLoading: false,
            });
          }
        }

        // Set up auth state change listener
        const { data: subscription } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log(`[AuthProvider] Auth state change: ${event}`);
          if (mounted.current) {
            await updateSessionState(session);
          }
        });

        // Return cleanup function
        return () => {
          subscription.subscription.unsubscribe();
        };
      } catch (error) {
        console.error('[AuthProvider] Initialization error:', error);
        if (mounted.current) {
          setState({
            ...initialAuthState,
            isLoading: false,
            error: error instanceof Error ? error : new Error('Failed to initialize auth'),
          });
        }
      }
    };

    initialize();

    // Cleanup on unmount
    return () => {
      mounted.current = false;
    };
  }, [supabase, fetchProfile, updateSessionState]);

  // Provide context
  return (
    <AuthContext.Provider
      value={{
        ...state,
        supabase,
        signIn,
        signUp,
        signOut,
        clearError,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
