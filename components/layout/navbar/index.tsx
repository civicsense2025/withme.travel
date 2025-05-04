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
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isLoading } = useAuth();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
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
            <Link href={user ? '/trips/create' : '/login?redirect=/trips/create'}>
              <Button size="sm" className="rounded-full h-8">
                <PlusCircle className="h-4 w-4 mr-1" />
                <span>{user ? 'New Trip' : 'Sign In'}</span>
              </Button>
            </Link>
          )}
          <UserMenu />
        </div>

        <div className="md:hidden flex items-center gap-2">
          {!isLoading && (
            <Link href={user ? '/trips/create' : '/login?redirect=/trips/create'}>
              <Button size="sm" className="rounded-full h-8">
                <PlusCircle className="h-4 w-4" />
                <span className="sr-only">{user ? 'New Trip' : 'Sign In'}</span>
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
        <div className="fixed inset-0 z-[9999] flex">
          {/* Overlay (solid background) */}
          <div className="absolute inset-0 bg-background" onClick={() => setMobileOpen(false)} />
          {/* Fullscreen Sheet */}
          <div className="relative w-full h-full flex flex-col p-4 z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-lg">Menu</span>
              <Button
                variant="ghost"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X />
              </Button>
            </div>
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'py-2 px-2 rounded hover:bg-muted',
                    isActive(link.href) && 'bg-muted'
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4">
              <NavbarSearch mobileView onSearch={() => setMobileOpen(false)} />
            </div>
            <div className="mt-4">
              <ThemeToggle emojiOnly />
            </div>
            <div className="mt-auto pt-4 border-t border-muted">
              <UserMenu />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
