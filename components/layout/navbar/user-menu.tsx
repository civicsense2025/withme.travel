'use client';

import Link from 'next/link';
import { useState } from 'react';
import { LogOut, Settings, User, Map, PlusCircle, Bookmark, MapPin } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function UserMenu() {
  const { user, profile, signOut, isLoading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Get user initials for avatar
  const getInitials = () => {
    if (!user) return 'U';
    if (profile?.name) {
      return profile.name
        .split(' ')
        .map((part) => part.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return user.email?.charAt(0).toUpperCase() || 'U';
  };

  // Handle logout with loading state
  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut();
    // No need to reset state as the page will refresh
  };

  // Show skeleton during loading
  if (isLoading) {
    return <Skeleton className="h-8 w-8 rounded-full" />;
  }

  // Return nothing if no user (sign in button is handled by the parent)
  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={profile?.avatar_url || user.user_metadata?.avatar_url || ''}
              alt={profile?.name || user.email || 'User'}
            />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none truncate">
              {profile?.name || user.email}
            </p>
            {profile?.name && (
              <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/trips" className="cursor-pointer">
              <Map className="mr-2 h-4 w-4" />
              <span>My Trips</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/saved" className="cursor-pointer">
              <Bookmark className="mr-2 h-4 w-4" />
              <span>Saved</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Account</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/travel-map" className="cursor-pointer">
              <MapPin className="mr-2 h-4 w-4" />
              <span>Travel Map</span>
            </Link>
          </DropdownMenuItem>
          {profile?.is_admin && (
            <DropdownMenuItem asChild>
              <Link href="/admin/dashboard" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Admin Panel</span>
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/support" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Contribute</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <span className="flex items-center">
              <Skeleton className="h-4 w-4 mr-2 rounded-full animate-pulse" />
              <span>Logging out...</span>
            </span>
          ) : (
            <>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
