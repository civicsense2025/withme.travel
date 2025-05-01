'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

type User = {
  id: string;
  name: string;
  avatar_url?: string;
  last_active: number;
};

export function PresenceIndicator() {
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const params = useParams();
  const tripId = params.id as string;
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase.channel(`presence:trip:${tripId}`);

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
            .map((p: any) => p.user) as User[];
          setActiveUsers(users);
        })
        .on(
          'presence',
          { event: 'join' },
          ({ key, newPresences }: { key: string; newPresences: any[] }) => {
            const newUser = newPresences[0].user as User;
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
            const leftUser = leftPresences[0].user as User;
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
  }, [tripId, supabase]);

  // Filter out users who haven't been active in the last 5 minutes
  const recentlyActiveUsers = activeUsers.filter(
    (user) => Date.now() - user.last_active < 5 * 60 * 1000
  );

  if (recentlyActiveUsers.length <= 1) return null;

  return (
    <div className="flex items-center space-x-1">
      <span className="text-sm text-muted-foreground mr-2">Currently viewing:</span>
      <div className="flex -space-x-2">
        {recentlyActiveUsers.slice(0, 5).map((user) => (
          <TooltipProvider key={user.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-6 w-6 border-2 border-background">
                  <AvatarImage
                    src={user.avatar_url || `/api/avatar?name=${encodeURIComponent(user.name)}`}
                    alt={user.name}
                  />
                  <AvatarFallback>{(user.name || '').substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="bottom">{user.name}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
        {recentlyActiveUsers.length > 5 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-6 w-6 border-2 border-background">
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
