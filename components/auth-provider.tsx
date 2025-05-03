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
  const [supabase] = useState(() => 
    createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
  );
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize the auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get the current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user as ExtendedUser);
          
          // Fetch user profile data if session exists
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentSession.user.id)
              .single();
              
            if (profile) {
              setUser(prev => prev ? { 
                ...prev, 
                profile: {
                  name: profile.name || profile.full_name || '',
                  avatar_url: profile.avatar_url,
                  username: profile.username,
  } 
              } : null);
            }
          } catch (profileError) {
            console.error('Error fetching user profile:', profileError);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(newSession);
        setUser(newSession?.user as ExtendedUser || null);
        
        // Fetch user profile on sign in
        if (newSession?.user) {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', newSession.user.id)
              .single();
              
            if (profile) {
              setUser(prev => prev ? { 
                ...prev, 
                profile: {
                  name: profile.name || profile.full_name || '',
                  avatar_url: profile.avatar_url,
                  username: profile.username,
  } 
              } : null);
            }
          } catch (profileError) {
            console.error('Error fetching user profile:', profileError);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
      }
    });

    return () => { 
      authListener.subscription.unsubscribe(); 
    };
  }, [supabase]);

  // Authentication methods
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    const { error } = await supabase.auth.signUp({ 
      email, 
      password, 
      options: { data: metadata } 
    });
    if (error) throw error;
  };

  const refreshSession = async () => {
    if (isRefreshing) return;
    
    try {
      setIsRefreshing(true);
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      setSession(data.session);
      setUser(data.session?.user as ExtendedUser || null);
    } catch (error) {
      console.error('Error refreshing session:', error);
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
      {children}
    </AuthContext.Provider>
  );
}