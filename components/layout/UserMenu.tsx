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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu';
import { Skeleton } from '@/components/ui/skeleton';
import { createBrowserClient } from '@supabase/ssr';
import type { Session } from '@supabase/supabase-js';
import { LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  serverSession?: Session | null;
  topPosition?: boolean; // New prop for mobile positioning
}

// Add type guard for onboarding_complete
function hasOnboardingComplete(profile: unknown): profile is { onboarding_completed: boolean } {
  return !!profile && typeof profile === 'object' && 'onboarding_completed' in profile;
}

export default function UserMenu({ serverSession = null, topPosition = false }: UserMenuProps) {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = React.useState<MenuStatus>(
    isLoading ? MenuStatus.LOADING : user ? MenuStatus.LOGGED_IN : MenuStatus.LOGGED_OUT
  );
  const [signOutError, setSignOutError] = React.useState<string | null>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);

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
      setMenuOpen(false);
      router.push('/?justLoggedOut=1');
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
        <Button variant="outline" className="h-8 px-3 rounded-full ghost text-sm">
          Sign In
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

  if (topPosition) {
    // Mobile view - avatar/email toggles menu
    return (
      <div className="w-full relative flex flex-col mt-2 mb-2 md:hidden">
        {/* User info row (toggle) */}
        <button
          className="flex items-center gap-3 w-full py-2 focus:outline-none"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="user-mobile-menu"
        >
          <Avatar className="h-10 w-10">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
            <AvatarFallback>{getInitials(displayName, email)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col text-left">
            <span className="text-sm font-medium truncate">{displayName}</span>
            {email && <span className="text-xs text-gray-500 truncate">{email}</span>}
          </div>
          <span className="ml-auto text-lg">{menuOpen ? '▲' : '▼'}</span>
        </button>

        {/* Menu links in a scrollable area, only when open */}
        <div
          className={`flex-1 min-h-0 overflow-y-auto pb-8 transition-all duration-500 ease-in-out ${menuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}
          id="user-mobile-menu"
          aria-hidden={!menuOpen}
        >
          <div className="mt-4 flex flex-col space-y-4 pl-2">
            {/* Onboarding link if not complete */}
            {hasOnboardingComplete(user?.profile) &&
              user.profile.onboarding_completed === false && (
                <Link
                  href="/onboarding"
                  className="text-yellow-900 bg-yellow-50 font-semibold rounded px-2 py-1 mb-1"
                  onClick={() => setMenuOpen(false)}
                >
                  ✨ Complete Onboarding
                </Link>
              )}
            {[
              { href: '/trips', label: '🧳 My Trips' },
              { href: '/saved', label: '💾 Saved' },
              { href: '/settings', label: '👤 Account' },
              { href: '/travel-map', label: '🗺️ Travel Map' },
              ...(isAdmin ? [{ href: '/admin/dashboard', label: '🛠️ Admin Panel' }] : []),
              { href: '/support', label: '🤝 Contribute' },
            ].map((item, idx) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm transition-all duration-500"
                style={{
                  transitionDelay: menuOpen ? `${idx * 60 + 80}ms` : `${(6 - idx) * 40}ms`,
                  opacity: menuOpen ? 1 : 0,
                  transform: menuOpen ? 'translateY(0)' : 'translateY(-16px)',
                }}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Desktop dropdown menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 rounded-full" aria-label="Open user menu">
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
          {/* Onboarding link if not complete */}
          {hasOnboardingComplete(user?.profile) && user.profile.onboarding_completed === false && (
            <DropdownMenuItem asChild className="bg-yellow-50 text-yellow-900 font-semibold">
              <Link href="/onboarding">✨ Complete Onboarding</Link>
            </DropdownMenuItem>
          )}
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
