'use client';

import { useEffect } from 'react';
import { startOpenReplay, identifyUser } from '@/app/lib/openreplay';
import { useAuth } from '@/components/auth-provider';

export function OpenReplayProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  // Initialize OpenReplay once when component mounts (client-side only)
  useEffect(() => {
    const tracker = startOpenReplay();

    // Clean up function
    return () => {
      tracker?.stop();
    };
  }, []);

  // Identify user when they log in
  useEffect(() => {
    if (!user) return;

    // Attach user info to session recordings
    identifyUser(user.id, {
      email: user.email,
      name: user.user_metadata?.full_name || user.email,
      role: user.user_metadata?.role || 'user',
    });
  }, [user]);

  return <>{children}</>;
}
