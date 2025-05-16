/**
 * PresenceIndicator Component
 * 
 * Shows currently active users in real-time using Supabase Presence.
 */

'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

/**
 * User presence information
 */
export type UserPresence = {
  /** User's unique identifier */
  id: string;
  /** User's display name */
  name: string;
  /** User's avatar URL */
  avatar_url?: string;
  /** Timestamp of last activity */
  last_active: number;
};

/**
 * Props for PresenceIndicator
 */
export interface PresenceIndicatorProps {
  /** Optional className for styling */
  className?: string;
  /** How many minutes of inactivity before user is considered inactive */
  inactiveThresholdMinutes?: number;
  /** Custom channel name (defaults to tripId from route params) */
  channelId?: string;
  /** Custom label text */
  labelText?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get initials from user profile for avatar fallback
 */
function getProfileInitials(user: any): string {
  const name = user?.name;
  if (name && typeof name === 'string') {
    return name
      .split(' ')
      .map((part: string) => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
  if (user?.email) {
    return user.email.charAt(0).toUpperCase();
  }
  return 'U';
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * PresenceIndicator shows real-time user presence in the application
 */
export function PresenceIndicator({
  className = '',
  inactiveThresholdMinutes = 5,
  channelId,
  labelText = 'Currently viewing:',
}: PresenceIndicatorProps) {
  const [activeUsers, setActiveUsers] = useState<UserPresence[]>([]);
  const params = useParams();
  const tripId = params?.tripId as string;
  const supabase = createClient();
  
  // Use provided channelId or fall back to tripId from route
  const effectiveChannelId = channelId || tripId;
  
  useEffect(() => {
    if (!effectiveChannelId) return;
    
    const channel = supabase.channel(`presence:${effectiveChannelId}`);
    
    // Set up presence tracking
    const trackPresence = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!user) return;
      
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('id', user.id)
        .single();
      
      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const users = Object.values(state)
            .flat()
            .map((p: any) => p.user) as UserPresence[];
          setActiveUsers(users);
        })
        .on(
          'presence',
          { event: 'join' },
          ({ key, newPresences }: { key: string; newPresences: any[] }) => {
            const newUser = newPresences[0].user as UserPresence;
            setActiveUsers((prev) => {
              if (prev.some((u) => u.id === newUser.id)) {
                return prev.map((u) => (u.id === newUser.id ? newUser : u));
              }
              return [...prev, newUser];
            });
          }
        )
        .on(
          'presence',
          { event: 'leave' },
          ({ key, leftPresences }: { key: string; leftPresences: any[] }) => {
            const leftUser = leftPresences[0].user as UserPresence;
            setActiveUsers((prev) => prev.filter((u) => u.id !== leftUser.id));
          }
        )
        .subscribe(async (status: string) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({
              user: {
                id: user.id,
                name: profile?.name || user.email?.split('@')[0] || 'Anonymous',
                avatar_url: profile?.avatar_url,
                last_active: Date.now(),
              },
            });
          }
        });
    };
    
    trackPresence();
    
    // Update presence every 30 seconds
    const interval = setInterval(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await channel.track({
          user: {
            id: user.id,
            last_active: Date.now(),
          },
        });
      }
    }, 30000);
    
    return () => {
      clearInterval(interval);
      channel.unsubscribe();
    };
  }, [effectiveChannelId, supabase, inactiveThresholdMinutes]);
  
  // Filter out users who haven't been active within the threshold
  const recentlyActiveUsers = activeUsers.filter(
    (user) => Date.now() - user.last_active < inactiveThresholdMinutes * 60 * 1000
  );
  
  // Don't show if there's just one or zero users
  if (recentlyActiveUsers.length <= 1) return null;
  
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <span className="text-sm text-muted-foreground mr-2">{labelText}</span>
      <div className="flex -space-x-2">
        {recentlyActiveUsers.slice(0, 5).map((user) => (
          <TooltipProvider key={user.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-8 w-8 border-2 border-background">
                  {user.avatar_url ? (
                    <AvatarImage
                      src={user.avatar_url}
                      alt={user.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : null}
                  <AvatarFallback>{getProfileInitials(user)}</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(user.last_active).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
        {recentlyActiveUsers.length > 5 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-8 w-8 border-2 border-background">
                  <AvatarFallback>+{recentlyActiveUsers.length - 5}</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {recentlyActiveUsers
                  .slice(5)
                  .map((user) => user.name)
                  .join(', ')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
} 