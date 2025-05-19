/**
 * UserNav Layout
 *
 * Displays user navigation (profile, settings, logout, etc).
 * @module components/layout/UserNav
 */

'use client';

import React from 'react';
import { PAGE_ROUTES } from '@/utils/constants/routes';

import Link from 'next/link';
import { LogOut, Settings, User, Map, PlusCircle, Bookmark, MapPin } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/use-auth';
import { ErrorBoundary } from '@sentry/nextjs';

// Get profile initials - shared function to ensure consistency
function getProfileInitials(user: any): string {
  const name = user?.profile?.name;
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

/**
 * UserNav component props
 */
export interface UserNavProps {
  /** User name */
  name: string;
  /** Avatar URL */
  avatarUrl?: string;
  /** Additional className for styling */
  className?: string;
}

function UserNavContent() {
  const { user } = useAuth();

  const handleSignOut = async () => {
    // TODO: Implement sign out logic if available
  };

  const displayName = user?.email ?? 'User';
  const avatarUrl = null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="h-8 w-8 rounded-full" />
          ) : (
            <span className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
              {getProfileInitials(user)}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none truncate">{displayName}</p>
            {user?.email && (
              <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/trips">
              <Map className="mr-2 h-4 w-4" />
              <span className="capitalize">Trips</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/itineraries">
              <Map className="mr-2 h-4 w-4" />
              <span className="capitalize">Itineraries</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/saved">
              <Bookmark className="mr-2 h-4 w-4" />
              <span className="capitalize">Saved Items</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={PAGE_ROUTES.SETTINGS}>
              <User className="mr-2 h-4 w-4" />
              <span className="capitalize">Account</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/travel-map">
              <MapPin className="mr-2 h-4 w-4" />
              <span className="capitalize">Travel Map</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/support">
              <span className="mr-2 text-sm">❤️</span>
              <span className="capitalize">Support Us</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span className="capitalize">Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * UserNav layout (placeholder)
 */
export function UserNav({ name, avatarUrl, className }: UserNavProps) {
  // TODO: Implement user nav UI
  return (
    <nav className={className} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} style={{ width: 32, height: 32, borderRadius: '50%' }} />
      ) : (
        <span style={{ width: 32, height: 32, borderRadius: '50%', background: '#eee', display: 'inline-block', textAlign: 'center', lineHeight: '32px' }}>{name[0]}</span>
      )}
      <span>{name}</span>
      {/* TODO: Add nav links (profile, settings, logout) */}
    </nav>
  );
}

export default UserNav;
