// components/auth-provider.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient, Session, User } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { FIELDS } from '@/utils/constants/database';
import { TABLES } from '@/utils/constants/tables';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';

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

// Add a helper to get a cookie value by name (client-side)
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export function AuthProvider({ initialSession, children }: AuthProviderProps) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const [supabase] = useState<SupabaseClient<Database>>(() =>
    createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
  );

  const [session, setSession] = useState<Session | null>(initialSession);
  const [user, setUser] = useState<ExtendedUser | null>(
    initialSession ? { ...initialSession.user } : null
  );
  const [isLoading, setIsLoading] = useState<boolean>(!initialSession);

  async function fetchUserProfile(userId: string) {
    const { data, error } = await supabase
      .from(TABLES.PROFILES)
      .select(['name', 'avatar_url', 'username', 'email'].join(','))
      .eq('id', userId)
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
        setSession((s) => ({ ...s, user: data.user }) as Session);
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
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
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
    });
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  // --- GUEST TO USER GROUP CLAIM LOGIC ---
  useEffect(() => {
    // Only run if user is present (just signed up/logged in)
    if (!user || !user.id) return;
    // Only run in browser
    if (typeof window === 'undefined') return;
    // Check for guest_token cookie
    const guestToken = getCookie('guest_token');
    if (!guestToken) return;
    // Defensive: only run once per session
    if ((window as any)._withme_claimed_guest_groups) return;
    (window as any)._withme_claimed_guest_groups = true;

    // Claim guest groups
    (async () => {
      // Find all group_guest_members for this guest_token
      const { data: guestMemberships, error } = await supabase
        .from('group_guest_members')
        .select('group_id')
        .eq('guest_token', guestToken);
      if (error || !guestMemberships || guestMemberships.length === 0) return;
      let firstGroupId: string | null = null;
      // For each group, insert into group_members if not already present
      for (const [i, gm] of guestMemberships.entries()) {
        const groupId = gm.group_id;
        if (i === 0) firstGroupId = groupId;
        // Check if already a member
        const { data: existing } = await supabase
          .from('group_members')
          .select('id')
          .eq('group_id', groupId ?? '')
          .eq('user_id', user.id ?? '')
          .maybeSingle();
        if (!existing) {
          await supabase.from('group_members').insert({
            group_id: groupId ?? '',
            user_id: user.id ?? '',
            role: 'member',
            status: 'active',
          });
        }
        // Optionally: remove guest membership
        await supabase
          .from('group_guest_members')
          .delete()
          .eq('group_id', groupId ?? '')
          .eq('guest_token', guestToken ?? '');
      }
      // Show toast/banner for first group
      if (firstGroupId) {
        toast({
          title: 'Your group was saved!',
          description: (
            <span>
              Click{' '}
              <a href={`/groups/${firstGroupId}`} className="underline text-primary">
                here
              </a>{' '}
              to open it.
            </span>
          ),
        });
      }
      // Clear the guest_token cookie
      document.cookie = 'guest_token=; Max-Age=0; path=/; SameSite=Lax';
    })();
  }, [user, supabase]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
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
    setSession((s) => ({ ...s, user: data.user }) as Session);
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
