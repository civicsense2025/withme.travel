'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { PlusCircle, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserMenu from './user-menu';
import { NavbarSearch } from './navbar-search';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/use-auth';

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
  const { user, isLoading } = useAuth();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mobile-container flex h-14 items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          withme.travel
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                !isActive(link.href) && 'text-muted-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <NavbarSearch />
          <ThemeToggle />
          {!isLoading && (
            <Link href={user ? '/trips' : '/login?redirect=/trips/create'}>
              <Button size="sm" className="rounded-full h-8">
                <span>{user ? 'Manage Trips' : 'Plan a Trip'}</span>
              </Button>
            </Link>
          )}
          <UserMenu />
        </div>

        <div className="md:hidden flex items-center gap-2">
          {!isLoading && (
            <Link href={user ? '/trips' : '/login?redirect=/trips/create'}>
              <Button size="sm" className="rounded-full h-8">
                <span className="sr-only md:not-sr-only">{user ? 'Manage Trips' : 'Plan a Trip'}</span>
                <PlusCircle className="h-4 w-4 md:ml-1 md:mr-0" />
              </Button>
            </Link>
          )}
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

      {mobileOpen && (
        <div className="fixed inset-0 z-[9999] flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setMobileOpen(false)} 
          />
          
          {/* Slide-in Menu Panel */}
          <div 
            className="relative w-4/5 max-w-xs h-screen bg-background border-l border-border flex flex-col z-10 animate-in slide-in-from-right duration-300"
          >
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
            <div className="flex flex-col h-full pt-16 pb-6 px-6">
              {/* User avatar and menu at the top */}
              <div className="mb-6">
                <UserMenu topPosition />
              </div>
              
              {/* Divider */}
              <div className="border-t border-muted my-4"></div>

              {/* Search */}
              <div className="mb-6">
                <NavbarSearch mobileView onSearch={() => setMobileOpen(false)} />
              </div>

              {/* Divider */}
              <div className="border-t border-muted my-4"></div>

              {/* Navigation Links */}
              <nav className="flex flex-col gap-6">
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

              {/* Theme Toggle */}
              <div className="mt-6 flex items-center">
                <div className="mr-2 text-sm text-muted-foreground">Theme:</div>
                <ThemeToggle />
              </div>

              {/* Footer margin to prevent cutoff */}
              <div className="mt-auto pt-8 pb-4"></div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
