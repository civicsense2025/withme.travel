import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { createSupabaseClient, resetSupabaseClient } from '../utils/supabase';

// Authentication context type
interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: any | null; // Replace 'any' with your Profile type
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string) => Promise<{ error: any | null, data: any | null }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
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
};

// Create context
const AuthContext = createContext<AuthContextType>(defaultContextValue);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const supabase = createSupabaseClient();

  // Function to get the user profile
  const getProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    return data;
  };

  // Function to refresh the session
  const refreshSession = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
      
      if (data.session?.user) {
        const profile = await getProfile(data.session.user.id);
        setProfile(profile);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  // Initialize session and auth listeners
  useEffect(() => {
    setIsLoading(true);
    
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);
        
        if (data.session?.user) {
          const profile = await getProfile(data.session.user.id);
          setProfile(profile);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const profile = await getProfile(session.user.id);
          setProfile(profile);
        } else {
          setProfile(null);
        }
      }
    );

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with email:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }

      console.log('Sign in successful!');
      return { error: null };
    } catch (error) {
      console.error('Unexpected error during sign in:', error);
      return { error };
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign up with email:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Sign up error:', error);
        return { error, data: null };
      }

      console.log('Sign up successful!', data);
      return { error: null, data };
    } catch (error) {
      console.error('Unexpected error during sign up:', error);
      return { error, data: null };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      resetSupabaseClient();
      setSession(null);
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
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
