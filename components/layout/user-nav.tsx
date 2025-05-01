'use client';

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
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/use-auth';
import { ErrorBoundary } from '@sentry/nextjs';

// Get profile initials - shared function to ensure consistency
function getProfileInitials(profile: any, user: any): string {
  if (profile?.name) {
    // Get first letters of each word in the name
    return profile.name
      .split(' ')
      .map((part: string) => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
  return user?.email?.charAt(0).toUpperCase() || 'U';
}

function UserNavContent() {
  const { user, profile, signOut } = useAuth();
  const isAdmin = profile?.is_admin;

  const handleSignOut = async () => {
    await signOut();
    // Optional: Add redirect logic if needed, though signOut might handle it
  };

  if (!user) {
    // Render nothing or a login button if needed in contexts where UserNav might be shown to logged-out users
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            {/* Use profile avatar first, fallback to user metadata, then initial */}
            <AvatarImage
              src={profile?.avatar_url || user.user_metadata?.avatar_url || ''}
              alt={profile?.name || user.email || 'User'}
            />
            <AvatarFallback>{getProfileInitials(profile, user)}</AvatarFallback>
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
            <Link href="/trips">
              <Map className="mr-2 h-4 w-4" />
              <span className="lowercase">my trips</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/itineraries">
              <Map className="mr-2 h-4 w-4" />
              <span className="lowercase">itineraries</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/saved">
              <Bookmark className="mr-2 h-4 w-4" />
              <span className="lowercase">saved items</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={PAGE_ROUTES.SETTINGS}>
              <User className="mr-2 h-4 w-4" />
              <span className="lowercase">account</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/travel-map">
              <MapPin className="mr-2 h-4 w-4" />
              <span className="lowercase">travel map</span>
            </Link>
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem asChild>
              <Link href="/admin/dashboard">
                {' '}
                {/* Link to admin dashboard */}
                <Settings className="mr-2 h-4 w-4" />
                <span className="lowercase">admin panel</span>
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span className="lowercase">Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Export the UserNav component with an error boundary
export function UserNav() {
  return (
    <ErrorBoundary
      fallback={
        <Link href="/login">
          <button
            className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium"
            title="Auth error - Click to log in"
          >
            U
          </button>
        </Link>
      }
    >
      <UserNavContent />
    </ErrorBoundary>
  );
}
