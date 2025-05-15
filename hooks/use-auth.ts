'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/utils/supabase/client';
import { Session, User } from '@supabase/supabase-js';

/**
 * Hook for accessing authentication state
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user || null);
      setIsLoading(false);
    });

    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    isLoading,
    error,
    isAuthenticated: !!user,
  };
} 