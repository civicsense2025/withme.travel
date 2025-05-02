import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { createSupabaseClient, resetSupabaseClient } from '../utils/supabase';
import NetInfo from '@react-native-community/netinfo';

// Debug mode flag
const DEBUG_MODE = __DEV__;

// Debug utility
const debugLog = (message: string, data?: any) => {
  if (DEBUG_MODE) {
    if (data) {
      console.log(`[Auth] ${message}`, data);
    } else {
      console.log(`[Auth] ${message}`);
    }
  }
};

// Authentication context type
interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: any | null; // Replace 'any' with your Profile type
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string) => Promise<{ error: any | null; data: any | null }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  googleSignIn: () => Promise<{ error: any | null }>;
}

// Default context value
const defaultContextValue: AuthContextType = {
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  signIn: async () => ({ error: new Error('AuthContext not initialized') }),
  signUp: async () => ({ error: new Error('AuthContext not initialized'), data: null }),
  signOut: async () => {},
  refreshSession: async () => {},
  refreshProfile: async () => {},
  googleSignIn: async () => ({ error: new Error('AuthContext not initialized') }),
};

// Create context
const AuthContext = createContext<AuthContextType>(defaultContextValue);

// Pre-initialize Supabase client to avoid delays
const supabaseClient = createSupabaseClient();

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initAttempts, setInitAttempts] = useState(0);
  const [networkConnected, setNetworkConnected] = useState<boolean | null>(null);

  // Function to get the user profile
  const getProfile = async (userId: string) => {
    try {
      debugLog(`Fetching profile for user: ${userId}`);
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        debugLog('Error fetching profile:', error);
        return null;
      }

      debugLog('Profile fetched successfully');
      return data;
    } catch (error) {
      debugLog('Exception in getProfile:', error);
      return null;
    }
  };

  // Function to refresh the session
  const refreshSession = async () => {
    debugLog('Refreshing session');
    try {
      setInitAttempts((prev) => prev + 1);
      const { data } = await supabaseClient.auth.getSession();

      debugLog('Session refresh result:', {
        hasSession: !!data.session,
        userId: data.session?.user?.id,
      });

      setSession(data.session);
      setUser(data.session?.user ?? null);

      if (data.session?.user) {
        const profile = await getProfile(data.session.user.id);
        setProfile(profile);
      }

      // Only turn off loading after successful init
      setIsLoading(false);
    } catch (error) {
      debugLog('Error refreshing session:', error);
      // Still turn off loading to avoid infinite state
      setIsLoading(false);
    }
  };

  // Check network status
  useEffect(() => {
    // Check initial network state
    NetInfo.fetch().then((state) => {
      debugLog('Network state:', {
        isConnected: state.isConnected,
        type: state.type,
      });
      setNetworkConnected(state.isConnected);
    });

    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state) => {
      debugLog('Network state changed:', {
        isConnected: state.isConnected,
        type: state.type,
      });
      setNetworkConnected(state.isConnected);

      // If we gain connection and we're still loading, try again
      if (state.isConnected && isLoading && initAttempts < 3) {
        debugLog('Network connected, retrying session init');
        refreshSession();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isLoading, initAttempts]);

  // Initialize session and auth listeners with timeout
  useEffect(() => {
    debugLog('Initializing auth');
    setIsLoading(true);

    // Set a timeout to avoid permanent loading state
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        debugLog('Auth initialization timed out');
        setIsLoading(false);
      }
    }, 10000);

    // Get initial session
    const initializeAuth = async () => {
      try {
        debugLog('Getting initial session');
        const { data } = await supabaseClient.auth.getSession();

        debugLog('Initial session result:', {
          hasSession: !!data.session,
          userId: data.session?.user?.id,
        });

        setSession(data.session);
        setUser(data.session?.user ?? null);

        if (data.session?.user) {
          const profile = await getProfile(data.session.user.id);
          setProfile(profile);
        }
      } catch (error) {
        debugLog('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
        clearTimeout(timeoutId);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      debugLog('Auth state changed', { event, userId: session?.user?.id });
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const profile = await getProfile(session.user.id);
        setProfile(profile);
      } else {
        setProfile(null);
      }
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      debugLog('Attempting to sign in with email:', email);

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        debugLog('Sign in error:', error);
        return { error };
      }

      debugLog('Sign in successful!');
      return { error: null };
    } catch (error) {
      debugLog('Unexpected error during sign in:', error);
      return { error };
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string) => {
    try {
      debugLog('Attempting to sign up with email:', email);

      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
      });

      if (error) {
        debugLog('Sign up error:', error);
        return { error, data: null };
      }

      debugLog('Sign up successful!', data);
      return { error: null, data };
    } catch (error) {
      debugLog('Unexpected error during sign up:', error);
      return { error, data: null };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      debugLog('Signing out');
      await supabaseClient.auth.signOut();
      resetSupabaseClient();
      setSession(null);
      setUser(null);
      setProfile(null);
      debugLog('Sign out complete');
    } catch (error) {
      debugLog('Error signing out:', error);
    }
  };

  // Google sign-in function
  const googleSignIn = async () => {
    try {
      debugLog('Attempting Google sign-in');
      const { error } = await supabaseClient.auth.signInWithOAuth({ provider: 'google' });
      if (error) debugLog('Google sign-in error:', error);
      return { error };
    } catch (error) {
      debugLog('Unexpected error during Google sign-in:', error);
      return { error };
    }
  };

  // Context value
  const value = {
    session,
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    refreshSession,
    refreshProfile: async () => {
      if (user) {
        debugLog(`Refreshing profile for user: ${user.id}`);
        const profileData = await getProfile(user.id);
        setProfile(profileData);
        return profileData;
      }
      return null;
    },
    googleSignIn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
