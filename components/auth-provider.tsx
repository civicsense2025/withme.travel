"use client"

import type React from "react"
import type { AuthChangeEvent, Session, User as SupabaseUser } from "@supabase/supabase-js"

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { DB_TABLES, DB_FIELDS, PAGE_ROUTES } from "@/utils/constants"

type AuthContextType = {
  user: SupabaseUser | null
  loading: boolean
  signOut: () => Promise<void>
  isGoogleConnected: boolean
  supabase: any
  session: Session | null
  profile: any | null
  error: Error | null
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGoogleConnected, setIsGoogleConnected] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const router = useRouter()

  const fetchUserProfile = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setProfile(null);
      return;
    }
    let fetchCompleted = false; // Flag to track completion
    try {
      console.log('[AuthProvider] Fetching profile for user:', userId);
      const { data, error: profileError } = await supabase
        .from(DB_TABLES.PROFILES)
        .select('*') // Consider selecting only necessary fields
        .eq(DB_FIELDS.PROFILES.ID, userId)
        .single();
      
      fetchCompleted = true; // Mark as completed after await

      if (profileError) {
        // If profile not found, it might not be an error (e.g., during signup)
        if (profileError.code !== 'PGRST116') { 
          console.error('[AuthProvider] Supabase error fetching user profile:', profileError.message, { code: profileError.code, details: profileError.details, hint: profileError.hint });
          setError(new Error(`Profile fetch failed: ${profileError.message}`)); // Set specific error
        } else {
          console.log('[AuthProvider] Profile not found for user (PGRST116), likely new user:', userId);
        }
        setProfile(null); 
      } else {
        console.log('[AuthProvider] Profile fetched successfully for user:', userId);
        setProfile(data);
        setError(null); // Clear previous errors on success
      }
    } catch (err: any) {
      fetchCompleted = true; // Mark as completed even if exception occurred after await started
      console.error('[AuthProvider] Exception during user profile fetch for user:', userId, err);
      setError(err instanceof Error ? err : new Error('Unknown error fetching profile'));
      setProfile(null);
    } finally {
       // Optional: Log if the fetch didn't seem to complete (though JS async/await makes this less likely)
       if (!fetchCompleted) {
           console.warn('[AuthProvider] fetchUserProfile finally block reached but fetchCompleted flag is false for user:', userId);
       }
       // Note: setLoading(false) is handled by the calling useEffects
    }
  }, [supabase]);

  // Function to manually refresh session and user state
  const refreshSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log('[AuthProvider] Manually refreshing session...');
    try {
      const { data, error: sessionError } = await supabase.auth.refreshSession();
      if (sessionError) throw sessionError;
      
      const newSession = data.session;
      const newUser = data.user;
      console.log('[AuthProvider] Session refreshed:', newSession);
      setSession(newSession);
      setUser(newUser);
      await fetchUserProfile(newUser?.id);
      
    } catch (err: any) {
      console.error('[AuthProvider] Error refreshing session:', err);
      setError(err);
      // Clear state on refresh error
      setSession(null);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [supabase, fetchUserProfile]);

  useEffect(() => {
    console.log('[AuthProvider] Initializing...');
    setLoading(true);

    // Attempt to get the initial session
    supabase.auth.getSession().then(async ({ data: { session: initialSession }, error: initialError }: { data: { session: Session | null }, error: Error | null }) => {
      if (initialError) {
        console.error('[AuthProvider] Error getting initial session:', initialError);
        setError(initialError);
      } else {
         console.log('[AuthProvider] Initial session fetched:', initialSession);
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        await fetchUserProfile(initialSession?.user?.id);
      }
      setLoading(false);
    });

    // Set up the auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, newSession: Session | null) => {
      console.log(`[AuthProvider] Auth event: ${event}`, newSession);
      setLoading(true);
      setSession(newSession);
      const newUser = newSession?.user ?? null;
      setUser(newUser);
      await fetchUserProfile(newUser?.id);
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const signOut = async () => {
    setUser(null)
    setIsGoogleConnected(false)
    setLoading(true)
    try {
      console.log("AuthProvider: Signing out...");
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("AuthProvider: Sign out error:", error);
      } else {
        console.log("AuthProvider: Sign out successful.");
      }
    } catch(e) {
      console.error("AuthProvider: Exception during sign out:", e);
    } finally {
       router.push(PAGE_ROUTES.HOME);
    }
  }

  console.log("AuthProvider: Rendering with state:", { user: !!user, loading, isGoogleConnected });

  const value = {
    user,
    loading,
    signOut,
    isGoogleConnected,
    supabase,
    session,
    profile,
    error,
    refreshSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
