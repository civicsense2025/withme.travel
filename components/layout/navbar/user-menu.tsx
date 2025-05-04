'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { createBrowserClient } from '@supabase/ssr';
import type { Session } from '@supabase/supabase-js';

enum MenuStatus {
  LOADING = 'LOADING',
  LOGGED_OUT = 'LOGGED_OUT',
  LOGGED_IN = 'LOGGED_IN',
  LOGGING_OUT = 'LOGGING_OUT',
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    return name
      .split(' ')
      .map((w) => w.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
  if (email) return email.charAt(0).toUpperCase();
  return 'U';
}

export default function UserMenu({ serverSession = null }: { serverSession?: Session | null }) {
  const { user, isLoading, signOut } = useAuth();
  const [status, setStatus] = React.useState<MenuStatus>(
    isLoading ? MenuStatus.LOADING : user ? MenuStatus.LOGGED_IN : MenuStatus.LOGGED_OUT
  );
  const [signOutError, setSignOutError] = React.useState<string | null>(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = useRef(createBrowserClient(supabaseUrl, supabaseAnonKey)).current;

  React.useEffect(() => {
    if (isLoading) return setStatus(MenuStatus.LOADING);
    if (!user) return setStatus(MenuStatus.LOGGED_OUT);
    setStatus(MenuStatus.LOGGED_IN);
  }, [isLoading, user]);

  const handleSignOut = async () => {
    setStatus(MenuStatus.LOGGING_OUT);
    try {
      await signOut();
    } catch (err: any) {
      setSignOutError(err.message);
      setStatus(MenuStatus.LOGGED_IN);
    }
  };

  if (status === MenuStatus.LOADING) {
    return <Skeleton className="h-8 w-8 rounded-full" />;
  }

  if (status === MenuStatus.LOGGED_OUT) {
    return (
      <Link href="/login">
        <Button variant="outline" className="h-8 px-3 rounded-full text-sm">
          🚪 Sign In
        </Button>
      </Link>
    );
  }

  if (status === MenuStatus.LOGGING_OUT) {
    return <Skeleton className="h-8 w-8 rounded-full animate-pulse" />;
  }

  // Logged in
  const displayName = user?.profile?.name ?? user?.email ?? 'User';
  const avatarUrl = user?.profile?.avatar_url;
  const email = user?.email;
  const isAdmin = false;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 rounded-full"aria-label="Open user menu">
          <Avatar className="h-8 w-8">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
            <AvatarFallback>{getInitials(displayName, email)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-0.5">
            <span className="text-sm font-medium truncate">{displayName}</span>
            {email && <span className="text-xs text-gray-500 truncate">{email}</span>}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/trips">🧳 My Trips</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/saved">💾 Saved</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">👤 Account</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/travel-map">🗺️ Travel Map</Link>
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem asChild>
              <Link href="/admin/dashboard">🛠️ Admin Panel</Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/support">🆘 Support</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/contribute">🤝 Contribute</Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-red-600 hover:bg-red-100">
          🚪 Log out
        </DropdownMenuItem>
        {signOutError && <div className="px-2 py-1 text-xs text-red-600">{signOutError}</div>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}