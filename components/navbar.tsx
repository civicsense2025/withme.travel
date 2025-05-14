'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { PlusCircle, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserMenu from './layout/user-menu';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface NavLink {
  href: string;
  label: string;
}

const navLinks: NavLink[] = [
  { href: '/trips', label: 'My Trips' },
  { href: '/destinations', label: 'Destinations' },
  { href: '/itineraries', label: 'Itineraries' },
  { href: '/groups', label: 'Groups' },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isLoading, signOut } = useAuth();
  const { toast } = useToast();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ">
      <div className="w-full flex h-16 items-center justify-between px-4 md:px-8 max-w-[2000px] mx-auto">
        <Link
          href="/"
          className="font-extrabold text-2xl md:text-2xl lg:text-3xl flex items-center tracking-tight leading-none select-none"
          style={{ letterSpacing: '-0.03em' }}
        >
          withme.
        </Link>

        {/* Centered nav links */}
        <nav className="hidden md:flex items-center justify-center flex-1 mx-4">
          <div className="flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary flex items-center',
                  !isActive(link.href) && 'text-muted-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          {/* Start Planning CTA Dropdown (desktop) */}
          <div className="relative group">
            <Button
              size="sm"
              className="rounded-full h-8 font-semibold px-5 bg-travel-purple text-purple-900 hover:bg-purple-300 transition-colors"
              aria-haspopup="true"
              aria-expanded="false"
            >
              Start Planning
            </Button>
            <div className="absolute left-0 mt-2 w-48 rounded-xl shadow-lg bg-white dark:bg-black border border-border opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto transition-opacity z-50">
              <Link
                href="/trips/create"
                className="block px-5 py-3 text-sm hover:bg-travel-purple/10 rounded-t-xl transition-colors"
              >
                Plan a Trip
              </Link>
              <Link
                href="/groups/create"
                className="block px-5 py-3 text-sm hover:bg-travel-purple/10 rounded-b-xl transition-colors"
              >
                Form a Group
              </Link>
            </div>
          </div>
          <UserMenu />
        </div>

        <div className="md:hidden flex items-center gap-2">
          {/* Start Planning CTA Dropdown (mobile) */}
          <div className="relative">
            <Button
              size="sm"
              className="rounded-full h-10 w-auto font-semibold px-6 bg-travel-purple text-purple-900 hover:bg-purple-300 transition-colors text-base"
              aria-haspopup="true"
              aria-expanded={mobileOpen ? 'true' : 'false'}
              onClick={() => setMobileOpen((open) => !open)}
            >
              Start Planning
            </Button>
            {/* Dropdown for mobile, only show if mobileOpen is true */}
            {mobileOpen && (
              <div className="absolute left-0 mt-2 w-48 rounded-xl shadow-lg bg-white dark:bg-black border border-border z-50">
                <Link
                  href="/trips/create"
                  className="block px-5 py-3 text-sm hover:bg-travel-purple/10 rounded-t-xl transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Plan a Trip
                </Link>
                <Link
                  href="/groups/create"
                  className="block px-5 py-3 text-sm hover:bg-travel-purple/10 rounded-b-xl transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Form a Group
                </Link>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            className="p-2"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile menu - Use portal to ensure it's mounted properly at the document level */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[9999] flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* Slide-in Menu Panel */}
          <div className="relative w-4/5 max-w-xs h-screen bg-background border-l border-border flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Close Button - Top right */}
            <div className="absolute top-4 right-4">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Menu Items */}
            <div className="flex flex-col h-full px-6 pt-8 pb-6">
              {/* Top-aligned content area: UserMenu, then navLinks, then theme toggle */}
              <div className="overflow-y-auto">
                {/* User avatar and menu at the top */}
                <div>
                  <UserMenu topPosition />
                </div>
                {/* Navigation Links directly under user info, no extra margin */}
                <nav className="flex flex-col gap-4 mt-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'text-base font-medium',
                        isActive(link.href) ? 'text-primary' : 'text-muted-foreground'
                      )}
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                {/* Theme Toggle below nav links */}
                <div className="mt-6 flex items-center">
                  <ThemeToggle />
                </div>
              </div>
              {/* Logout button fixed at the bottom of the menu */}
              {user && (
                <button
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 text-base shadow-lg border-none focus:outline-none focus:ring-2 focus:ring-red-400 mt-auto"
                  style={{ marginBottom: 'env(safe-area-inset-bottom, 1rem)' }}
                  onClick={async () => {
                    try {
                      await signOut();
                      setMobileOpen(false);
                      if (typeof window !== 'undefined') {
                        window.location.href = '/?justLoggedOut=1';
                      }
                    } catch (err: any) {
                      toast({
                        title: 'Logout failed',
                        description: err?.message || 'Something went wrong logging out.',
                        variant: 'destructive',
                      });
                    }
                  }}
                >
                  <span className="inline-block">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18 12H9m0 0l3-3m-3 3l3 3"
                      />
                    </svg>
                  </span>
                  Log out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
