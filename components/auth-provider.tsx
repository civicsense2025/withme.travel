// components/auth-provider.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient, Session, User } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { TABLES, FIELDS } from '@/utils/constants/database';

export interface ExtendedUser extends User {
  profile?: {
    name: string | null;
    avatar_url: string | null;
    username: string | null;
    email?: string | null;
  };
}

export interface AuthProviderProps {
  initialSession: Session | null;
  children: React.ReactNode;
}

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

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ initialSession, children }: AuthProviderProps) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const [supabase] = useState<
    SupabaseClient<Database>
  >(() => createBrowserClient<Database>(supabaseUrl, supabaseAnonKey));

  const [session, setSession] = useState<Session | null>(initialSession);
  const [user, setUser] = useState<ExtendedUser | null>(
    initialSession ? { ...initialSession.user } : null
  );
  const [isLoading, setIsLoading] = useState<boolean>(!initialSession);

  async function fetchUserProfile(userId: string) {
    const { data, error } = await supabase
      .from(TABLES.PROFILES)
      .select([
        FIELDS.PROFILES.NAME,
        FIELDS.PROFILES.AVATAR_URL,
        FIELDS.PROFILES.USERNAME,
        FIELDS.PROFILES.EMAIL,
      ].join(','))
      .eq(FIELDS.PROFILES.ID, userId)
      .single();

    if (error || !data || typeof data !== 'object' || 'error' in data) {
      console.error('[AuthProvider] fetchUserProfile error', error);
      return null;
    }
    
    // Now we know data is the correct type, use as unknown first to avoid type errors
    const profileData = data as unknown as Record<string, any>;
    return {
      name: profileData.name as string | null,
      avatar_url: profileData.avatar_url as string | null,
      username: profileData.username as string | null,
      email: profileData.email as string | null,
    };
  }

  useEffect(() => {
    if (initialSession) {
      setIsLoading(false);
      return;
    }
    supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        setSession(null);
        setUser(null);
      } else if (data?.user) {
        setSession((s) => ({ ...s, user: data.user } as Session));
        setUser({ ...data.user });
      }
      setIsLoading(false);
    });
  }, [supabase, initialSession]);

  useEffect(() => {
    if (!session?.user) return;
    fetchUserProfile(session.user.id).then((profile) => {
      if (profile) {
        setUser((u) =>
          u
            ? {
                ...u,
                profile: {
                  name: profile.name,
                  avatar_url: profile.avatar_url,
                  username: profile.username,
                  email: profile.email,
                },
              }
            : null
        );
      }
    });
  }, [session]);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          fetchUserProfile(newSession.user.id).then((profile) => {
            setUser({
              ...newSession.user,
              profile: profile || undefined,
            });
          });
        } else {
          setUser(null);
        }
      }
    );
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const signUp = async (
    email: string,
    password: string,
    metadata?: Record<string, any>
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    if (error) throw error;
  };

  const refreshSession = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      setSession(null);
      setUser(null);
      return;
    }
    setSession((s) => ({ ...s, user: data.user } as Session));
    setUser((u) => (u ? { ...u, profile: u.profile } : null));
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