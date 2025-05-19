'use client';

import { useEffect } from 'react';
import { startOpenReplay, identifyUser } from '@/app/lib/openreplay';
import { useAuth } from '@/hooks/use-auth';

export function OpenReplayProvider({ 
  children, 
  className 
}: { 
  children: React.ReactNode;
  className?: string; // Allow className to be passed safely
}) {
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

  // Use a div instead of Fragment to allow className props
  return <div className={className}>{children}</div>;
}
