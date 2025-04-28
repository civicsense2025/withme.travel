"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, repairAuthState } from "@/utils/supabase/client";
import type { User, Session, AuthError, AuthChangeEvent } from '@supabase/supabase-js'; // Import Supabase types
import { DB_TABLES, DB_FIELDS } from "@/utils/constants/database";
import { Database, Profile } from "@/types/database.types";
import { toast } from 'sonner';

// Define a type for the profile data (matching profiles table)
interface UserProfile extends Omit<Profile, 'created_at' | 'updated_at'> {
  username: string | null;
}

// Combine Supabase User and local Profile
export interface AppUser extends User {
  profile: UserProfile | null; // Profile is now part of AppUser
}

interface AuthState {
  session: Session | null;
  user: AppUser | null; 
  isLoading: boolean;
  error: AuthError | Error | null; // Can be Supabase auth error or general error
  errorMessage?: string; // User-friendly error message
}

// Define the auth context type
export interface AuthContextType {
  session: Session | null;
  user: AppUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: AuthError | Error | null;
  errorMessage?: string;
  supabase: ReturnType<typeof createClient>;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, username: string) => Promise<any>;
  signOut: () => Promise<void>;
}

// Create the context
export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // === INITIALIZATION - all initializations at the top ===
  // Create supabase client first as it doesn't depend on any state
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  
  // === STATE INITIALIZATION - all state in a single object at the top ===
  const [authState, setAuthState] = useState<AuthState>({
    session: null,
    user: null,
    isLoading: true,
    error: null,
    errorMessage: undefined,
  });

  // === REFS - all refs defined together ===
  // Track refs for initialization and lifecycle
  const initialSetupCompleted = useRef(false);
  const authCheckInProgress = useRef(false);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mounted = useRef(true); // Track component lifecycle
  const shouldUpdate = useRef(true); // Track if we should update state
  const pendingRequests = useRef<AbortController[]>([]); // Track pending requests
  const fallbackTimerFired = useRef(false); // Track if fallback timer has fired

  // === STATE UPDATE HELPERS - basic helpers that don't depend on other functions ===
  // Helper to set loading state - simple helper defined early
  const setIsLoading = useCallback((loading: boolean) => {
    if (shouldUpdate.current) {
      setAuthState(prev => ({ ...prev, isLoading: loading }));
    }
  }, []);

  // Helper to get user-friendly error message
  const getFriendlyErrorMessage = (error: AuthError | Error): string => {
    // Log the technical error details for debugging
    console.error('[AuthProvider] Original error:', error);
    
    // Common Supabase auth error codes and messages
    if ('code' in error) {
      switch (error.code) {
        case 'auth/invalid-email':
        case 'invalid_email':
          return 'Please enter a valid email address';
        case 'auth/wrong-password':
        case 'invalid_credentials':
          return 'Incorrect email or password. Please try again';
        case 'auth/user-not-found':
        case 'user_not_found':
          return 'No account found with this email';
        case 'auth/too-many-requests':
        case 'too_many_requests':
          return 'Too many attempts. Please try again later';
        case 'auth/email-already-in-use':
        case 'email_taken':
          return 'An account already exists with this email';
        case 'auth/weak-password':
        case 'weak_password':
          return 'Password is too weak. Please use a stronger password';
      }
    }
    
    // Handle specific error messages
    const msg = error.message.toLowerCase();
    
    if (msg.includes('network') || msg.includes('fetch') || msg.includes('connection')) {
      return 'Unable to connect to the server. Please check your internet connection';
    }
    
    if (msg.includes('timeout')) {
      return 'The request timed out. Please try again';
    }
    
    if (msg.includes('invalid login')) {
      return 'Incorrect email or password. Please try again';
    }
    
    if (msg.includes('email not confirmed')) {
      return 'Please verify your email address before signing in';
    }
    
    if (msg.includes('password')) {
      return 'There was an issue with your password. Please try again';
    }
    
    // Generic but still friendly message as fallback
    return 'An unexpected error occurred. Please try again';
  };

  // Helper to set error state and show a toast notification
  const setError = useCallback((error: AuthError | Error | null) => {
    // Only update state if we should (not during unmount or transitions)
    if (shouldUpdate.current) {
      const errorMessage = error ? getFriendlyErrorMessage(error) : undefined;
      
      // Log more detailed information about the error for debugging
      if (error) {
        console.error("[AuthProvider] Authentication error:", error);
        
        // Log additional details if available
        if ('code' in error) {
          console.error("[AuthProvider] Error code:", error.code);
        }
        
        if ('status' in error) {
          console.error("[AuthProvider] Error status:", (error as any).status);
        }
        
        // Try to log the stack trace if available
        if (error.stack) {
          console.error("[AuthProvider] Error stack:", error.stack);
        }
      }
      
      // Update auth state with error information
      setAuthState(prev => ({ ...prev, error, errorMessage }));
      
      // Show a toast notification if there's an error
      if (error) {
        toast.error('Authentication error', {
          description: errorMessage,
          duration: 5000,
          id: 'auth-error', // Add ID to prevent duplicate toasts
        });
      }
    } else if (error) {
      // Just log the error if we shouldn't update state
      console.error("[AuthProvider] Error occurred during cleanup/transition:", error);
    }
  }, []);

  // Helper to clear error state
  const clearError = useCallback(() => {
    if (shouldUpdate.current) {
      setAuthState(prev => ({ ...prev, error: null, errorMessage: undefined }));
    }
  }, []);
  
  // Enhanced profile fetch with better error handling
  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    if (!userId) return null;
    if (!supabase) return null;
    try {
      console.log("[AuthProvider] Fetching profile for user:", userId);
      const { data, error } = await supabase
        .from(DB_TABLES.PROFILES)
        .select('id, name, avatar_url, username, is_admin')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("[AuthProvider] Error fetching profile:", error);
        return null; 
      }
      console.log("[AuthProvider] Profile fetched successfully:", !!data);
      return data as UserProfile;
    } catch (e) {
      console.error("[AuthProvider] Exception fetching profile:", e);
      return null;
    }
  }, [supabase]);

  // === INTERNAL HELPER FUNCTIONS (useCallback for stability) ===

  // Define _refreshSession first
  const _refreshSession = useCallback(async (): Promise<{ session: Session | null }> => {
    if (!supabase) return { session: null };
    if (!mounted.current) return { session: null }; // Check if component is mounted

    console.log("[AuthProvider] Attempting to refresh session...");
    try {
      // Use refreshSession method
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error("[AuthProvider] Error refreshing session:", error);
        // If refresh fails, likely the refresh token is invalid or expired, treat as signed out
        if (mounted.current) {
          setAuthState({ session: null, user: null, isLoading: false, error, errorMessage: getFriendlyErrorMessage(error) });
          setError(error);
        }
        return { session: null };
      }

      if (data.session && mounted.current) {
        console.log("[AuthProvider] Session refreshed successfully.");
        const userWithProfile = data.user ? { ...data.user, profile: await fetchProfile(data.user.id) } : null;
        setAuthState(prev => ({ ...prev, session: data.session, user: userWithProfile, isLoading: false, error: null, errorMessage: undefined }));
        
        // If session has expiry, set up the next refresh
        // NOTE: We cannot call _setupSessionRefresh directly here anymore due to reordering
        // Instead, the effect hook will handle setting up the refresh based on the updated session
        // if (data.session.expires_at) {
        //   _setupSessionRefresh(data.session.expires_at); 
        // }
        return { session: data.session };
      }
      
      return { session: null }; // Should not happen if no error, but added for safety

    } catch (err) {
      console.error("[AuthProvider] Unexpected error during session refresh:", err);
      if (mounted.current) {
        setError(err as Error);
      }
      return { session: null };
    }
  // Dependencies: supabase, fetchProfile, mounted ref (removed _setupSessionRefresh)
  }, [supabase, fetchProfile, mounted]);

  // Define _setupSessionRefresh, depends on _refreshSession
  const _setupSessionRefresh = useCallback((expiresAt: number): void => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const expiresIn = expiresAt - currentTime;
    // Refresh slightly before expiry (e.g., 1 minute)
    const refreshTime = Math.max(10, expiresIn - 60) * 1000; // In milliseconds

    console.log(`[AuthProvider] Setting session refresh timer for ${refreshTime / 1000} seconds`);

    refreshTimerRef.current = setTimeout(async () => {
      console.log("[AuthProvider] Refresh timer fired. Attempting to refresh session.");
      // Call the refresh function directly here - it will be the latest version available in this scope
      await _refreshSession(); 
    }, refreshTime);
  // Dependencies: Only external setters/refs it directly uses, plus _refreshSession
  }, [setError, _refreshSession]);

  // Define _checkSessionState, depends on _setupSessionRefresh
  const _checkSessionState = useCallback(async (isInitialCheck = false): Promise<void> => {
    if (!supabase || authCheckInProgress.current) return;
    authCheckInProgress.current = true;
    if (isInitialCheck) {
      setIsLoading(true); 
    }
    console.log(`[AuthProvider] Checking session state (Initial: ${isInitialCheck})...`);
    try {
      // Attempt to repair potentially corrupted auth state first
      await repairAuthState();
      
      // Fetch current session
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("[AuthProvider] Error fetching session:", error);
        setError(error);
        setAuthState(prev => ({ ...prev, session: null, user: null }));
        return;
      }

      const { session } = data;
      console.log("[AuthProvider] Fetched session:", !!session);

      if (session) {
        const userWithProfile = session.user ? { ...session.user, profile: await fetchProfile(session.user.id) } : null;
        setAuthState(prev => ({ ...prev, session, user: userWithProfile, error: null, errorMessage: undefined }));
        if (session.expires_at) {
          _setupSessionRefresh(session.expires_at);
        }
      } else {
        setAuthState(prev => ({ ...prev, session: null, user: null }));
      }
    } catch (err) {
      console.error("[AuthProvider] Unexpected error during session check:", err);
      setError(err as Error);
    } finally {
      if (mounted.current) {
        setIsLoading(false);
        authCheckInProgress.current = false;
      }
    }
  // Dependencies: supabase, fetchProfile, setError, setIsLoading, _setupSessionRefresh, mounted ref
  }, [supabase, fetchProfile, setError, setIsLoading, _setupSessionRefresh, mounted]);

  // Define _initialSessionCheck, depends on _checkSessionState
  const _initialSessionCheck = useCallback(async (): Promise<void> => {
    console.log("[AuthProvider] Performing initial session check...");
    await _checkSessionState(true);
  // Dependency: _checkSessionState
  }, [_checkSessionState]);

  // === USECALLBACK WRAPPERS (Expose stable functions to context/effects) ===
  // These are not strictly necessary if the internal functions are already stable via useCallback,
  // but kept for clarity or potential future refactoring where internal functions might change.
  const checkSessionState = _checkSessionState;
  const initialSessionCheck = _initialSessionCheck;
  const refreshSession = _refreshSession;
  const setupSessionRefresh = _setupSessionRefresh;

  // === EFFECTS ===
  // Effect for initial auth state check and listener setup
  useEffect(() => {
    if (!initialSetupCompleted.current && !authState.isLoading) {
      console.log("[AuthProvider] Running initial session check effect");
      initialSessionCheck(); // Call the check function defined earlier
      initialSetupCompleted.current = true; // Mark as completed
    }

    // Setup refresh timer based on current session expiry
    if (authState.session?.expires_at) {
      setupSessionRefresh(authState.session.expires_at);
    }
    
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [authState.session, authState.isLoading, initialSessionCheck, setupSessionRefresh]);

  // === CONTEXT VALUE ===
  const value: AuthContextType = useMemo(() => {
    // Auth Methods using Supabase Client
    const signIn = async (email: string, password: string) => {
      if (!supabase) throw new Error("Supabase client not initialized");
      setIsLoading(true);
      clearError(); // Clear previous errors
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // State will update via onAuthStateChange listener
        return data;
      } catch (error: any) {
        console.error("Sign in error:", error);
        setError(error);
        // Ensure loading is false even on error, state change listener might not fire
        setIsLoading(false);
        throw error; // Re-throw for component handling
      }
    };

    const signUp = async (email: string, password: string, username: string) => {
      if (!supabase) throw new Error("Supabase client not initialized");
      setIsLoading(true);
      clearError(); // Clear previous errors
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { 
              username: username
            }
          }
        });
        if (error) throw error;
        // State will update via onAuthStateChange listener
        return data;
      } catch (error: any) {
        console.error("Sign up error:", error);
        setError(error);
        // Ensure loading is false even on error
        setIsLoading(false);
        throw error; // Re-throw for component handling
      }
    };

    const signOut = async () => {
      shouldUpdate.current = false; // Prevent updates during sign-out transition
      console.log("[AuthProvider] Attempting sign out...");
      setIsLoading(true);
      setError(null);

      // Cancel any pending requests
      pendingRequests.current.forEach(controller => controller.abort());
      pendingRequests.current = [];

      // Clear any refresh timers immediately
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }

      try {
        if (!supabase) throw new Error("Supabase client not initialized");
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('[AuthProvider] Error during sign out:', error);
          // Set error state even if update flag is false during transition
          setAuthState(prev => ({ ...prev, error, errorMessage: getFriendlyErrorMessage(error), isLoading: false }));
          // Do not re-enable updates here, let the auth state change handle it
          return; // Exit early on error
        } 
        
        console.log("[AuthProvider] Supabase signOut successful, clearing state...");
        // Clear local state immediately after successful sign out
        // Note: onAuthStateChange will also fire, but this ensures faster UI update
        setAuthState({
          session: null,
          user: null,
          isLoading: false, // Set loading false after sign out attempt
          error: null,
        });
        
        // Re-enable state updates after sign out process is complete
        shouldUpdate.current = true; 
        
        // Show success message
        toast.success("Signed out successfully", {
          description: "You have been signed out of your account",
          duration: 3000,
        });
        
        // Navigate to home page
        router.push('/');
        
      } catch (error: any) {
        console.error("[AuthProvider] Sign out error:", error);
        setError(error);
        setIsLoading(false);
        throw error; // Re-throw for component handling
      }
    };
    
    return {
      session: authState.session,
      user: authState.user,
      profile: authState.user?.profile || null,
      isLoading: authState.isLoading,
      error: authState.error,
      errorMessage: authState.errorMessage,
      signIn,
      signUp,
      signOut,
      supabase
    };
  }, [
    authState.session,
    authState.user,
    authState.isLoading,
    authState.error,
    authState.errorMessage,
    supabase,
    setIsLoading,
    setError,
    clearError,
    router,
    refreshTimerRef,
    shouldUpdate,
    pendingRequests
  ]); // List each dependency explicitly for better performance tracking

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
