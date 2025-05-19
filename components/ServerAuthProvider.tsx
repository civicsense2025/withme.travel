'use server';

import React from 'react';
import type { Session } from '@supabase/supabase-js';
import { createServerComponentClient } from '@/utils/supabase/server';
import { AuthProvider } from './auth-provider';

export interface ServerAuthProviderProps {
  children: React.ReactNode;
}

/**
 * A server-side auth provider that fetches session data
 * and passes it to the client-side AuthProvider
 */
export async function ServerAuthProvider({ children }: ServerAuthProviderProps) {
  // SSR: fetch session once, but handle missing session gracefully
  let session = null;
  try {
    const supabase = await createServerComponentClient();
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Supabase session error:', error);
      }
      session = null;
    } else {
      session = data?.session ?? null;
    }
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('No session found or Supabase error:', err);
    }
    session = null;
  }

  return <AuthProvider initialSession={session}>{children}</AuthProvider>;
}

export default ServerAuthProvider; 