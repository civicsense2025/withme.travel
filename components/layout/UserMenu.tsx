'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu';
import { Skeleton } from '@/components/ui/skeleton';

type User = {
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
  isAdmin?: boolean;
};

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

interface UserMenuProps {
  serverSession?: any | null;
  topPosition?: boolean;
}

export default function UserMenu({ serverSession = null, topPosition = false }: UserMenuProps) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [status, setStatus] = React.useState<MenuStatus>(
    isLoading ? MenuStatus.LOADING : user ? MenuStatus.LOGGED_IN : MenuStatus.LOGGED_OUT
  );

  React.useEffect(() => {
    if (isLoading) return setStatus(MenuStatus.LOADING);
    if (!user) return setStatus(MenuStatus.LOGGED_OUT);
    setStatus(MenuStatus.LOGGED_IN);
  }, [isLoading, user]);

  const handleSignOut = async () => {
    setStatus(MenuStatus.LOGGING_OUT);
    try {
      await logout();
      router.push('/?justLoggedOut=1');
    } catch (err: any) {
      console.error(err);
      setStatus(MenuStatus.LOGGED_IN);
    }
  };

  if (status === MenuStatus.LOADING) {
    return <Skeleton className="h-8 w-8 rounded-full" />;
  }

  if (status === MenuStatus.LOGGED_OUT) {
    return (
      <Link href="/login">
        <Button variant="outline" className="h-8 px-3 rounded-full ghost text-sm">
          Sign In
        </Button>
      </Link>
    );
  }

  // Logged in
  const displayName = user?.user_metadata?.full_name || user?.email || 'User';
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <DropdownMenu options={[]}>
      <DropdownMenuTrigger>
        <Button variant="ghost" className="h-8 w-8 p-0 rounded-full" aria-label="Open user menu">
          <Avatar className="h-8 w-8">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
            <AvatarFallback>{getInitials(displayName, user?.email)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-0.5">
            <span className="text-sm font-medium truncate">{displayName}</span>
            {user?.email && <span className="text-xs text-gray-500 truncate">{user.email}</span>}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />
        <Link href="/trips">
          <Button variant="link" className="w-full text-left">🧳 My Trips</Button>
        </Link>
        <Link href="/saved">
          <Button variant="link" className="w-full text-left">💾 Saved</Button>
        </Link>
        <Link href="/settings">
          <Button variant="link" className="w-full text-left">👤 Account</Button>
        </Link>
        <Link href="/travel-map">
          <Button variant="link" className="w-full text-left">🗺️ Travel Map</Button>
        </Link>
        {user?.role === 'admin' && (
          <Link href="/admin/dashboard">
            <Button variant="link" className="w-full text-left">🛠️ Admin Panel</Button>
          </Link>
        )}

        <DropdownMenuSeparator />
        <Button onClick={handleSignOut} className="text-red-600 hover:bg-red-100 w-full text-left">
          🚪 Log out
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}