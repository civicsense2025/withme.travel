'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { NavbarSearch } from './navbar-search';
import { MobileNav } from './mobile-nav';
import { UserMenu } from './user-menu';
import { ThemeToggle } from '@/components/theme-toggle';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="font-bold text-xl">withme.travel</Link>
        </div>
        <div className="hidden md:flex flex-1 items-center space-x-4 lg:space-x-6">
          <nav className="flex items-center space-x-4 lg:space-x-6">
            <Link
              href="/trips"
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                !isActive('/trips') && 'text-muted-foreground'
              )}
            >
              My Trips
            </Link>
            <Link
              href="/destinations"
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                !isActive('/destinations') && 'text-muted-foreground'
              )}
            >
              Destinations
            </Link>
            <Link
              href="/itineraries"
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                !isActive('/itineraries') && 'text-muted-foreground'
              )}
            >
              Itineraries
            </Link>
          </nav>
        </div>
        
        <div className="flex md:hidden flex-1 items-center justify-between">
          <div className="flex">
            <Link href="/" className="font-bold text-lg">withme.travel</Link>
          </div>
          <div className="flex items-center space-x-2">
            {!isLoading && (
              <Link href={user ? '/trips/create' : '/login?redirect=/trips/create'}>
                <Button size="sm" className="rounded-full h-8">
                  <PlusCircle className="h-4 w-4" />
                  <span className="sr-only">{user ? 'New Trip' : 'Sign In'}</span>
                </Button>
              </Link>
            )}
            <UserMenu />
            <MobileNav />
          </div>
        </div>

        <div className="ml-auto hidden md:flex items-center space-x-4">
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
      </div>
    </header>
  );
}
