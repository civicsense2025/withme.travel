"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient, User, Session, AuthError } from '@supabase/supabase-js';
import { DB_TABLES } from "@/utils/constants";
import { createClient, resetClient } from "@/utils/supabase/client";

// Define a type for the profile data (matching profiles table)
interface UserProfile {
  id: string;
  name: string | null;
  avatar_url: string | null;
  username: string | null;
  is_admin: boolean; // Assuming this exists in your profiles table
  // Add any other profile fields you fetch/need
}

// Combine Supabase User and local Profile
interface AppUser extends User {
  profile: UserProfile | null; // Profile is now part of AppUser
}

interface AuthState {
  session: Session | null;
  user: AppUser | null;
  isLoading: boolean;
  error: AuthError | Error | null; // Can be Supabase auth error or general error
  // supabase client is now managed separately, not part of this state object
}

// Export the context so it can be imported by the hook
export const AuthContext = createContext<AuthContextType | null>(null);

// Define AuthContextType including profile and session
export interface AuthContextType extends AuthState { // Inherit from AuthState
  supabase: SupabaseClient;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  profile: UserProfile | null; // Convenience accessor for profile
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname(); // Get current pathname for tracking changes
  const supabase = useMemo(() => createClient(), []); // Use our custom createClient

  // Single state object for auth status
  const [authState, setAuthState] = useState<AuthState>({
    session: null,
    user: null,
    isLoading: true,
    error: null,
  });

  // Fetch profile associated with a user ID
  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    if (!userId) return null;
    try {
      const { data, error } = await supabase
        .from(DB_TABLES.PROFILES)
        .select('id, name, avatar_url, username, is_admin') // Adjust fields as needed
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        // Don't set auth error state here, just return null profile
        return null; 
      }
      return data as UserProfile;
    } catch (e) {
      console.error("Exception fetching profile:", e);
      return null;
    }
  }, [supabase]); // Depend on supabase client instance

  // Force revalidation on pathname/route change
  useEffect(() => {
    const refreshAuthState = async () => {
      try {
        setAuthState(prev => ({ ...prev, isLoading: true }));
        
        // First, try to get session from localStorage directly
        let sessionFromStorage = null;
        let userFromStorage = null;
        
        if (typeof window !== 'undefined') {
          try {
            const storedAuth = localStorage.getItem('supabase.auth.token');
            if (storedAuth) {
              console.log("Found auth data in localStorage");
              const parsed = JSON.parse(storedAuth);
              sessionFromStorage = parsed.currentSession;
              
              if (sessionFromStorage?.user) {
                userFromStorage = {
                  ...sessionFromStorage.user,
                  profile: null // Will fetch this below
                };
                console.log("User found in localStorage:", userFromStorage.id);
              }
            }
          } catch (e) {
            console.error("Error reading from localStorage:", e);
          }
        }
        
        // Only call Supabase if we didn't find a session in localStorage
        if (!userFromStorage) {
          console.log("No user in localStorage, checking with Supabase API");
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) throw error;
          
          if (session?.user) {
            userFromStorage = {
              ...session.user,
              profile: null // Will fetch this below
            };
            sessionFromStorage = session;
            console.log("User found from Supabase API:", userFromStorage.id);
          } else {
            console.log("No user found in Supabase session");
          }
        }
        
        // Fetch profile if we have a user
        let profileData = null;
        if (userFromStorage?.id) {
          profileData = await fetchProfile(userFromStorage.id);
          console.log("Profile fetched:", profileData ? "success" : "not found");
        }
        
        setAuthState({
          session: sessionFromStorage,
          user: userFromStorage ? { ...userFromStorage, profile: profileData } : null,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error refreshing auth state:', error);
        setAuthState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: error instanceof Error ? error : new Error(String(error)) 
        }));
      }
    };

    refreshAuthState();
  }, [pathname, supabase, fetchProfile]); // Re-run when pathname changes

  // Helper to set loading state
  const setIsLoading = (loading: boolean) => {
    setAuthState(prev => ({ ...prev, isLoading: loading }));
  };

  // Helper to set error state
  const setError = (error: AuthError | Error | null) => {
     setAuthState(prev => ({ ...prev, error }));
  };

  // --- Auth Methods using Supabase Client ---
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null); // Clear previous errors
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // State will update via onAuthStateChange listener
    } catch (error: any) {
      console.error("Sign in error:", error);
      setError(error);
      // Ensure loading is false even on error, state change listener might not fire
      setIsLoading(false);
      throw error; // Re-throw for component handling
    }
    // Do not set loading false here, let onAuthStateChange handle it or the catch block
  };

  const signUp = async (email: string, password: string, username: string) => {
    setIsLoading(true);
    setError(null); // Clear previous errors
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            username: username, // Pass username here
            // name: username // Optionally set name as well if desired
          }
        }
      });
      if (error) throw error;
      // State will update via onAuthStateChange listener
    } catch (error: any) {
      console.error("Sign up error:", error);
      setError(error);
      // Ensure loading is false even on error
      setIsLoading(false);
      throw error; // Re-throw for component handling
    }
     // Do not set loading false here
  };

  const signOut = async () => {
    setIsLoading(true);
    setError(null); // Clear previous errors
    try {
      // Sign out from supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Use our custom resetClient to thoroughly clean up
      resetClient();
      
      // Clear state manually as onAuthStateChange might be delayed or not fire consistently on signout
      setAuthState({
        session: null,
        user: null,
        isLoading: false,
        error: null,
      });
      
      // Force reload the page to ensure complete cleanup
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (error: any) {
      console.error("Sign out error:", error);
      setError(error);
      // Ensure loading is false even on error
      setIsLoading(false);
      throw error; // Re-throw for component handling
    }
  };

  // Memoize context value, deriving directly from the single authState
  const value = useMemo(() => ({
    supabase,
    session: authState.session,
    user: authState.user,
    profile: authState.user?.profile || null, // Convenience accessor
    isLoading: authState.isLoading,
    error: authState.error,
    signIn,
    signUp,
    signOut,
  }), [supabase, authState, signIn, signUp, signOut]); // Depend on authState

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Keep useAuth hook as is, it consumes the context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
