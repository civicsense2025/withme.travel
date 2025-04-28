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

  // Function to check session state and synchronize with server
  const checkSessionState = useCallback(async (isInitialCheck = false) => {
    // Prevent concurrent session checks
    if (!supabase) return;
    if (authCheckInProgress.current) {
      console.log("[AuthProvider] Session check already in progress, skipping");
      return;
    }
    
    authCheckInProgress.current = true;
    
    try {
      console.log("[AuthProvider] Starting session check");
      
      if (isInitialCheck) {
        // Only set loading on initial check to prevent UI flicker
        setAuthState(prev => ({ ...prev, isLoading: true }));
      }
      
      // Get the session directly from Supabase client
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("[AuthProvider] Session check error:", error);
        setAuthState({
          session: null,
          user: null,
          isLoading: false,
          error,
        });
        authCheckInProgress.current = false;
        return;
      }
      
      console.log("[AuthProvider] Session check result:", !!session);
      
      // If session exists, fetch profile and set state
      if (session?.user?.id) {
        const profile = await fetchProfile(session.user.id);
        const appUser: AppUser = { ...session.user, profile };
        // Ensure we only update if component is still mounted
        if (mounted.current) {
          setAuthState({ session, user: appUser, isLoading: false, error: null });
        }
      } else {
        // No session found
        if (mounted.current) {
          setAuthState({ session: null, user: null, isLoading: false, error: null });
        }
      }
    } catch (err) {
      console.error("[AuthProvider] Unexpected error during session check:", err);
      if (mounted.current) {
         setAuthState({ session: null, user: null, isLoading: false, error: err instanceof Error ? err : new Error("Session check failed") });
      }
    } finally {
      authCheckInProgress.current = false;
    }
  }, [supabase, fetchProfile, setError]); // Include fetchProfile and setError in dependencies

  // Session refresh function with improved error handling
  const refreshSession = useCallback(async () => {
    if (!supabase) return { session: null };
    try {
      console.log("[AuthProvider] Refreshing session...");
      const { data, error } = await supabase.auth.refreshSession();
      
      // Check if component is still mounted before proceeding with state updates
      if (!mounted.current) {
        console.log("[AuthProvider] Component unmounted during session refresh - skipping updates");
        return { session: null };
      }
      
      if (error) {
        console.error("[AuthProvider] Session refresh error:", error);
        // Update auth state with the error
        setAuthState(prev => ({ 
          ...prev, 
          error: error
        }));
        return { session: null };
      }
      
      if (data?.session) {
        console.log("[AuthProvider] Session refreshed successfully");
        
        // If we have a new expiry time, setup the next refresh (only if still mounted)
        if (mounted.current && data.session.expires_at) {
          setupSessionRefresh(data.session.expires_at);
        }
        
        // Fetch profile only if component is still mounted
        let profileData = null;
        if (mounted.current && data.session.user) {
          try {
            profileData = await fetchProfile(data.session.user.id);
          } catch (err) {
            console.error("[AuthProvider] Error fetching profile after refresh:", err);
          }
        }
        
        // Check again if component is still mounted before updating state
        if (mounted.current) {
          setAuthState(prev => ({
            ...prev,
            session: data.session,
            user: data.session?.user ? 
              { ...data.session.user, profile: profileData } : 
              null,
            error: null // Clear any previous errors
          }));
        }
      } else {
        console.warn("[AuthProvider] Session refresh returned no session");
        if (mounted.current) {
          setAuthState(prev => ({
            ...prev,
            session: null,
            user: null,
            error: new Error("Session refresh returned no session"),
            errorMessage: "Your session could not be refreshed. Please try signing in again."
          }));
        }
      }
      
      return data;
    } catch (e) {
      console.error("[AuthProvider] Error refreshing session:", e);
      // Update auth state with the error and show toast only if still mounted
      if (mounted.current) {
        setError(e instanceof Error ? e : new Error(String(e)));
      }
      return { session: null };
    }
  }, [supabase, fetchProfile, setError, mounted]); // Include setError in dependencies

  // Setup a session refresh timer to refresh before session expires
  const setupSessionRefresh = useCallback((expiresAt: number) => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    const timeToExpiry = expiresAt - currentTime; // Time until expiry in seconds
    
    // Set refresh to happen 5 minutes before expiry, or immediately if already close
    const refreshTime = Math.max(0, timeToExpiry - 300) * 1000; // Convert to ms
    
    console.log(`[AuthProvider] Setting session refresh in ${refreshTime / 1000} seconds`);
    
    refreshTimerRef.current = setTimeout(() => {
      console.log("[AuthProvider] Running session refresh");
      
      // Use async/await and common error handling
      refreshSession().catch(error => {
        console.error("[AuthProvider] Session refresh failed:", error);
        // Use common error handling with user-friendly messages
        setError(error instanceof Error ? error : new Error(String(error)));
      });
    }, refreshTime);
  }, [refreshSession, setError]); // Include setError in dependencies

  // Initial session check function
  const initialSessionCheck = useCallback(async () => {
    await checkSessionState(true);
  }, [checkSessionState]);
  
  // Add a fallback timer to prevent infinite loading with improved error handling
  // Use component mount as the only dependency to ensure it only runs once
  useEffect(() => {
    console.log("[AuthProvider] Setting up fallback timer");
    
    // Use a longer timeout to give auth processes more time to complete
    const fallbackTimerId = setTimeout(() => {
      // Only take action if we're still in loading state and initialization isn't complete
      if (authState.isLoading && !initialSetupCompleted.current && !fallbackTimerFired.current) {
        console.warn("[AuthProvider] Fallback timer triggered - forcing loading state to false");
        fallbackTimerFired.current = true;
        
        // Only update state if we should
        if (shouldUpdate.current && mounted.current) {
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            error: new Error("Authentication state check timed out"),
            errorMessage: "Authentication is taking longer than expected. Please refresh the page."
          }));
          
          // Also reset any ongoing checks
          authCheckInProgress.current = false;
          
          // Attempt to recover the auth state
          repairAuthState().catch((e: Error) => {
            console.error("[AuthProvider] Failed to recover after auth timeout:", e);
          });
        }
      }
    }, 30000); // 30 second fallback (increased from 10s)
    
    return () => {
      console.log("[AuthProvider] Clearing fallback timer");
      clearTimeout(fallbackTimerId);
    };
  }, []); // Empty dependency array - only run on mount

  // Then set up the auth state change listener for future changes
  useEffect(() => {
    if (!supabase) return; // Add null check for supabase client

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log(`[AuthProvider] Auth state change event: ${event}`, !!session);
        
        // Skip all processing immediately if component unmounted
        if (!mounted.current) {
          console.log("[AuthProvider] Skipping auth state change processing - component unmounted");
          return;
        }
        
        // If the fallback timer has already fired, log it
        if (fallbackTimerFired.current) {
          console.log("[AuthProvider] Auth state change received after fallback timer fired");
        }
        
        // Take note of session state immediately to help with race condition
        if (session) {
          // If we have a session, capture it immediately to prevent the fallback timer
          // from wiping it out
          if (authState.isLoading && shouldUpdate.current) {
            console.log("[AuthProvider] Setting preliminary session state while fetching profile");
            // Set a transitional state that indicates we have a session but are still loading profile
            setAuthState(prev => ({
              ...prev,
              session: session,
              // Keep user loading until we fetch profile
              error: null // Clear any previous errors
            }));
          }
        }
        
        try {
          // Create abort controller for this request
          const controller = new AbortController();
          pendingRequests.current.push(controller);
          
          // Call the /api/auth/me endpoint to verify auth status server-side
          const meResponse = await fetch('/api/auth/me', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Important for cookies
            signal: controller.signal, // Allow cancellation
          });
          
          // Remove controller from pending requests
          pendingRequests.current = pendingRequests.current.filter(c => c !== controller);
          if (event === 'SIGNED_OUT') {
            console.log("[AuthProvider] SIGNED_OUT: Clearing session and user.");
            if (mounted.current) {
              setAuthState({
                session: null,
                user: null,
                isLoading: false,
                error: null
              });
            }
            return;
          }
          
          // For other events, fetch profile if needed
          let profileData: UserProfile | null = null;
          if (session?.user?.id) {
            try {
              profileData = await fetchProfile(session.user.id);
            } catch (profileError) {
              console.error("[AuthProvider] Error fetching profile within listener:", profileError);
              // Continue despite profile error
            }
          }

          // Skip further processing if component unmounted during async operations
          if (!mounted.current) {
            console.log("[AuthProvider] Component unmounted during auth state processing - aborting");
            return;
          }
          
          // Update state with session and profile data,
          // but only if the fallback timer hasn't already fired
          if (!fallbackTimerFired.current) {
            setAuthState({
              session,
              user: session?.user ? { ...session.user, profile: profileData } : null,
              isLoading: false,
              error: null // Clear error on successful auth change
            });
            
            console.log("[AuthProvider] Auth state successfully updated with session and profile");
            // Mark initialization as complete
            initialSetupCompleted.current = true;
          } else {
            console.log("[AuthProvider] Skipping auth state update because fallback timer already fired");
          }
        } catch (e) {
          // Only update error state if still mounted
          if (mounted.current) {
            console.error("[AuthProvider] Error processing auth state change:", e);
            setAuthState(prev => ({
              ...prev,
              isLoading: false,
              error: e instanceof Error ? e : new Error(String(e)),
              errorMessage: getFriendlyErrorMessage(e instanceof Error ? e : new Error(String(e)))
            }));
          } else {
            console.error("[AuthProvider] Error occurred after unmount:", e);
          }
        }
      }
    );

    // Cleanup function to unsubscribe and clear timers
    return () => {
      console.log("[AuthProvider] Starting cleanup process...");
      
      // Set flags to prevent further state updates and signal we're cleaning up
      mounted.current = false;
      shouldUpdate.current = false;
      
      // Cancel any pending requests
      console.log(`[AuthProvider] Cancelling ${pendingRequests.current.length} pending requests`);
      pendingRequests.current.forEach(controller => {
        try {
          controller.abort();
        } catch (e) {
          console.error("[AuthProvider] Error aborting request:", e);
        }
      });
      pendingRequests.current = [];
      
      // Clean up auth state listener
      if (authListener?.subscription) {
        console.log("[AuthProvider] Unsubscribing from auth listener");
        authListener.subscription.unsubscribe();
      }
      
      // Clean up any refresh timers
      if (refreshTimerRef.current) {
        console.log("[AuthProvider] Clearing session refresh timer");
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      
      // Check for pending auth operations
      if (authState.isLoading) {
        console.warn("[AuthProvider] Component unmounted while auth operation was in progress");
      }
      
      // Reset all ref flags
      authCheckInProgress.current = false;
      initialSetupCompleted.current = false;
      
      // Log completion of cleanup
      console.log("[AuthProvider] Cleanup process completed");
    };
  }, [supabase, fetchProfile, initialSessionCheck, setError]); // Restore dependencies

  // --- Auth Methods using Supabase Client --- 
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

  // Memoize the context value to prevent unnecessary re-renders
  const value: AuthContextType = useMemo(() => ({
    // Extract from authState to ensure TypeScript typing is correct
    session: authState.session,
    user: authState.user,
    profile: authState.user?.profile || null,
    isLoading: authState.isLoading,
    error: authState.error,
    errorMessage: authState.errorMessage,
    // Include memoized functions
    signIn,
    signUp,
    signOut,
    // Include the supabase client for direct access if needed
    supabase
  }), [
    // List dependencies explicitly
    authState.session,
    authState.user,
    authState.isLoading,
    authState.error,
    authState.errorMessage,
    signIn,
    signUp,
    signOut,
    supabase
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
