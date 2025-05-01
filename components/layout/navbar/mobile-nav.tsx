'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { Menu, LogOut, User, Map, Bookmark, MapPin, Search, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSearch } from '@/contexts/search-context';
import { NavbarSearch } from './navbar-search';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, profile, signOut, isLoading } = useAuth();
  const { openSearch } = useSearch();

  const isAdmin = profile?.is_admin;

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

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="p-0 w-[300px] sm:w-[350px]">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-muted">
            <Link href="/" className="font-bold text-lg" onClick={() => setIsOpen(false)}>
              withme.travel
            </Link>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <div className="mb-6">
              <NavbarSearch mobileView={true} onSearch={() => setIsOpen(false)} />
            </div>

            <div className="flex flex-col space-y-4">
              {isLoading ? (
                <div className="flex flex-col space-y-3">
                  <div className="h-10 w-full bg-muted animate-pulse rounded-md"></div>
                  <div className="h-10 w-full bg-muted animate-pulse rounded-md"></div>
                  <div className="h-10 w-full bg-muted animate-pulse rounded-md"></div>
                </div>
              ) : !user ? (
                <>
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      Sign Up
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/trips" onClick={() => setIsOpen(false)}>
                    <Button
                      variant="ghost"
                      className={cn('w-full justify-start', pathname === '/trips' && 'bg-muted')}
                    >
                      <Map className="mr-2 h-4 w-4" />
                      My Trips
                    </Button>
                  </Link>
                  <Link href="/saved" onClick={() => setIsOpen(false)}>
                    <Button
                      variant="ghost"
                      className={cn('w-full justify-start', pathname === '/saved' && 'bg-muted')}
                    >
                      <Bookmark className="mr-2 h-4 w-4" />
                      Saved
                    </Button>
                  </Link>
                  <Link href="/travel-map" onClick={() => setIsOpen(false)}>
                    <Button
                      variant="ghost"
                      className={cn(
                        'w-full justify-start',
                        pathname === '/travel-map' && 'bg-muted'
                      )}
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      Travel Map
                    </Button>
                  </Link>
                  <Link href="/settings" onClick={() => setIsOpen(false)}>
                    <Button
                      variant="ghost"
                      className={cn('w-full justify-start', pathname === '/settings' && 'bg-muted')}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Account
                    </Button>
                  </Link>
                  {isAdmin && (
                    <Link href="/admin/dashboard" onClick={() => setIsOpen(false)}>
                      <Button
                        variant="ghost"
                        className={cn(
                          'w-full justify-start',
                          pathname?.startsWith('/admin') && 'bg-muted'
                        )}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Admin
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center justify-between mt-6 pt-6 border-t border-muted">
              <span className="text-sm font-medium">Theme</span>
              <ThemeToggle />
            </div>
          </div>

          {!isLoading && user && (
            <div className="border-t border-muted p-4 bg-muted/30">
              <div className="flex items-center space-x-3 mb-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={profile?.avatar_url || user.user_metadata?.avatar_url || ''}
                    alt={profile?.name || user.email || 'User'}
                  />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium truncate">{profile?.name || user.email}</span>
                  {profile?.name && (
                    <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
                onClick={() => {
                  signOut();
                  setIsOpen(false);
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
