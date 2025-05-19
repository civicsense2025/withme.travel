'use client';

import { useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@/utils/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import * as authClient from '@/lib/client/auth';
import { isSuccess } from '@/lib/utils/result';

/**
 * Hook for accessing authentication state and actions
 */
export function useAuth() {
  // ============================================================================
  // STATE
  // ============================================================================
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // ============================================================================
  // INITIALIZE SESSION & LISTEN FOR CHANGES
  // ============================================================================
  useEffect(() => {
    const supabase = createBrowserClient();

    async function getSession() {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        setSession(data.session);
        setUser(data.session?.user || null);
      } catch (err) {
        console.error('Error getting auth session:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    }

    // Get initial session
    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user || null);
      setIsLoading(false);
    });

    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ============================================================================
  // AUTH ACTIONS
  // ============================================================================

  /**
   * Login with email and password
   */
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authClient.login({ email, password });
      if (!isSuccess(result)) {
        throw new Error(result.error || 'Login failed');
      }
      // After login, refresh session/user
      const supabase = createBrowserClient();
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user || null);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(new Error(errorMessage));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout current user
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authClient.logout();
      if (!isSuccess(result)) {
        throw new Error(result.error || 'Logout failed');
      }
      // After logout, clear session/user
      setSession(null);
      setUser(null);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(new Error(errorMessage));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Register a new user
   */
  const signup = useCallback(async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authClient.signup({ email, password, name });
      if (!isSuccess(result)) {
        throw new Error(result.error || 'Signup failed');
      }
      // After signup, refresh session/user
      const supabase = createBrowserClient();
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user || null);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(new Error(errorMessage));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Forgot password function
   */
  const forgotPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authClient.forgotPassword({ email });
      if (!isSuccess(result)) {
        throw new Error(result.error || 'Failed to send password reset email');
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(new Error(errorMessage));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Reset password function
   */
  const resetPassword = useCallback(async (password: string, token: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authClient.resetPassword({ password, token });
      if (!isSuccess(result)) {
        throw new Error(result.error || 'Failed to reset password');
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(new Error(errorMessage));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get the current user profile
   */
  const getProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authClient.getProfile();
      if (!isSuccess(result)) {
        throw new Error(result.error || 'Failed to get user profile');
      }
      setUser(result.value || null);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(new Error(errorMessage));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Check authentication status
   */
  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authClient.checkAuthStatus();
      if (!isSuccess(result)) {
        throw new Error(result.error || 'Failed to check auth status');
      }
      setUser(result.value?.user || null);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(new Error(errorMessage));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================================================
  // RETURNED API
  // ============================================================================
  return {
    user,
    session,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    signup,
    forgotPassword,
    resetPassword,
    getProfile,
    checkAuthStatus,
  };
}
