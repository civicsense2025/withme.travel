'use client';

import { PAGE_ROUTES } from '@/utils/constants/routes';
import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, PlusCircle, LogOut, Moon, Sun, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useTheme } from 'next-themes';
import { Logo } from '@/components/logo';
import { useSearch } from '@/contexts/search-context';
import { useAuth } from '@/lib/hooks/use-auth';
import { UserNav } from '@/components/layout/user-nav';
import { ErrorBoundary } from '@sentry/nextjs';
import { debugAuth, clearAuthData } from '@/lib/hooks/auth-debug';

// Create a client-only wrapper for the tooltip component
function ClientOnlyTooltip({ children, text }: { children: React.ReactNode; text: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    return setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Create a static Skeleton component that renders the same on server and client
function ClientSkeleton(props: React.ComponentProps<typeof Skeleton>) {
  const finalClassName = cn('bg-muted', props.className);

  return <div className={finalClassName} style={{ animation: 'none' }} aria-hidden="true" />;
}

// Create a dedicated NavItem component to handle loading states
function NavItem({
  href,
  isActive,
  isLoading,
  children,
}: {
  href: string;
  isActive: boolean;
  isLoading: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="h-5">
      {isLoading ? (
        <ClientSkeleton className="h-full w-16 rounded" />
      ) : (
        <Link
          href={href}
          className={cn(
            'text-sm font-medium transition-colors lowercase',
            isActive ? 'text-foreground' : 'text-muted-foreground',
            'hover:text-purple-500' // Static class instead of dynamic
          )}
        >
          {children}
        </Link>
      )}
    </div>
  );
}

// Loading placeholders with consistent DOM structure
function LoadingUserNavPlaceholder() {
  return (
    <div className="flex items-center gap-4">
      <div className="h-5 w-16">
        <ClientSkeleton className="h-full w-full rounded" />
      </div>
    </div>
  );
}

function LoadingUserAvatarPlaceholder() {
  return (
    <div className="h-8 w-8">
      <ClientSkeleton className="h-full w-full rounded-full" />
    </div>
  );
}

// Simple fallback component for auth errors
function AuthErrorFallback() {
  return (
    <div className="flex items-center gap-2">
      <Link href="/login">
        <Button variant="outline" size="sm" className="lowercase rounded-full">
          Login
        </Button>
      </Link>
      {process.env.NODE_ENV === 'development' && (
        <div
          onClick={() => window.location.reload()}
          className="text-xs text-muted-foreground underline cursor-pointer"
        >
          Reload
        </div>
      )}
    </div>
  );
}

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

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const { user, isLoading, signOut, refreshSession } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Combine loading states for consistency
  // We want to show the UI even if we're loading the auth state
  // This helps with UI stability and prevents flashing
  const isLoadingState = isLoading || !hasMounted;
  const { theme, setTheme } = useTheme();
  const { openSearch } = useSearch();

  // Mobile detection for responsive behavior
  const [isMobileView, setIsMobileView] = useState(false);

  // Merged resize effect
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setIsMobileView(isMobile);

      // Close menu when viewport becomes desktop
      if (!isMobile && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    // Set initial value
    handleResize();

    // Add listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen]);

  // Add a click handler for closing the menu when clicking outside
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.navbar-menu') && !target.closest('button[aria-label*="menu"]')) {
        setIsMenuOpen(false);
      }
    };

    // Close menu on Escape key press
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      return document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isMenuOpen]);

  // State to track how long loading has been active
  const [loadingDuration, setLoadingDuration] = useState(0);

  // Use this ref to track auth state for debugging
  // const authStateRef = useRef({
  //   isLoading,
  //   hasUser: !!user,
  //   userId: user?.id,
  //   profileId: profile?.id,
  // });

  // Update the ref when auth state changes (for debugging)
  useEffect(() => {
    // authStateRef.current = {
    //   isLoading,
    //   hasUser: !!user,
    //   userId: user?.id,
    //   profileId: profile?.id,
    // };
    // Log auth state changes for debugging - guard with development check
    // if (process.env.NODE_ENV === 'development') {
    //   console.log('[Navbar] Auth state updated:', {
    //     isLoading,
    //     hasUser: !!user,
    //     userId: typeof user?.id === 'string' ? user.id.substring(0, 8) : undefined,
    //     hasProfile: !!profile,
    //   });
    // }
  }, [isLoading, user]);

  // Set up monitoring for prolonged loading state
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isLoading) {
      // Start a timer when loading begins
      timer = setInterval(() => {
        return setLoadingDuration((prev) => prev + 500);
      }, 500);
    } else {
      // Reset when loading completes
      setLoadingDuration(0);
    }

    // Clean up timer
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLoading]);

  // Show a retry button if loading takes too long
  const showRetryButton = loadingDuration > 3000; // 3 seconds

  // Handle manual auth state refresh
  const handleForceRefresh = useCallback(() => {
    // if (process.env.NODE_ENV === 'development') {
    //   console.log('[Navbar] Force refreshing auth state');
    // }

    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }, []);

  const handleSignOut = async () => {
    return await signOut();
  };

  const toggleMenu = () => {
    return setIsMenuOpen((prevState) => !prevState);
  };

  const closeMenu = () => {
    return setIsMenuOpen(false);
  };

  const toggleTheme = () => {
    return setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 dark:border-border/20 bg-background/95 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between py-4 px-3 sm:px-4 md:px-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 md:gap-8">
          <div className="cursor-pointer" onClick={() => router.push('/')}>
            <Logo />
          </div>

          {/* Desktop Navigation - hidden on mobile */}
          <nav className="hidden md:flex gap-6 items-center">
            {/* Show My Trips link during loading or when user is logged in */}
            {(isLoadingState || user) && (
              <NavItem href="/trips" isActive={isActive('/trips')} isLoading={isLoadingState}>
                My Trips
              </NavItem>
            )}

            {/* Add Destinations link */}
            <NavItem
              href="/destinations"
              isActive={isActive('/destinations')}
              isLoading={isLoadingState}
            >
              Destinations
            </NavItem>

            {/* Add Itineraries link */}
            <NavItem
              href="/itineraries"
              isActive={isActive('/itineraries')}
              isLoading={isLoadingState}
            >
              Itineraries
            </NavItem>

            {/* Support Us link should always be visible */}
            <NavItem href="/support" isActive={isActive('/support')} isLoading={isLoadingState}>
              support us
            </NavItem>
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Search button - hidden on mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={openSearch}
            aria-label="Open search menu"
            className="h-8 w-8 rounded-full hidden md:flex"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Theme toggle - hidden on mobile */}
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          {/* Plan a trip button - visible on all screens */}
          <div className="relative">
            {!isLoadingState && (
              <Link href={user ? '/trips/create' : '/login?redirect=/trips/create'}>
                <ClientOnlyTooltip text={user ? 'Plan a new trip' : 'login to manage your trips'}>
                  <Button
                    className={cn(
                      'relative overflow-hidden lowercase rounded-full',
                      'bg-travel-purple hover:bg-purple-400 text-purple-900',
                      'text-xs sm:text-sm px-2 sm:px-3 py-1 h-7 sm:h-8',
                      'animate-pulse-soft-scale',
                      'before:absolute before:inset-0 before:bg-shimmer-gradient',
                      'before:bg-no-repeat before:bg-200%',
                      'before:animate-shimmer',
                      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-travel-purple'
                    )}
                  >
                    <span className="relative z-10 flex items-center">
                      <PlusCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                      <span>{user ? 'manage my trips' : 'sign in'}</span>
                    </span>
                  </Button>
                </ClientOnlyTooltip>
              </Link>
            )}
            {isLoadingState && (
              <div className="h-7 sm:h-8">
                <ClientSkeleton className="h-full w-24 sm:w-32 rounded-full" />
              </div>
            )}
          </div>

          {/* Mobile menu toggle - visible only on mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            className="h-8 w-8 rounded-full md:hidden"
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>

          {/* User dropdown - hidden on mobile, now using UserNav component with error boundary */}
          <div className="hidden md:flex items-center gap-4">
            <ErrorBoundary fallback={<AuthErrorFallback />}>
              {isLoadingState ? (
                <div className="flex items-center gap-2">
                  <LoadingUserAvatarPlaceholder />
                  {loadingDuration > 2000 && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        // Call refreshSession from auth provider
                        refreshSession();
                        // Force a page reload if refresh fails after 1 second
                        setTimeout(() => {
                          if (isLoading) {
                            window.location.reload();
                          }
                        }, 1000);
                      }}
                      className="h-6 w-6 rounded-full animate-pulse"
                      title="Refresh authentication"
                    >
                      <div className="h-4 w-4">↻</div>
                    </Button>
                  )}
                </div>
              ) : user ? <UserNav /> : null}
            </ErrorBoundary>
          </div>
        </div>

        {/* Add retry button when loading takes too long */}
        {showRetryButton && isLoadingState && (
          <div className="absolute top-16 left-0 right-0 bg-amber-100 dark:bg-amber-900 p-2 text-center">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              Login status is taking longer than expected.
              <button onClick={handleForceRefresh} className="underline ml-2 font-medium">
                Refresh now
              </button>
              {process.env.NODE_ENV === 'development' && (
                <>
                  <span className="mx-2">|</span>
                  <button 
                    onClick={() => {
                      debugAuth();
                    }} 
                    className="underline font-medium"
                  >
                    Debug
                  </button>
                  <span className="mx-2">|</span>
                  <button 
                    onClick={() => {
                      if (confirm('This will clear all auth data and reload the page. Continue?')) {
                        clearAuthData();
                        setTimeout(() => window.location.reload(), 500);
                      }
                    }} 
                    className="underline font-medium text-red-700 dark:text-red-400"
                  >
                    Reset Auth
                  </button>
                </>
              )}
            </p>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isMenuOpen && (
          <>
            {/* Backdrop overlay - increased z-index */}
            <motion.div
              key="mobile-menu-backdrop"
              className="fixed inset-0 z-50 bg-black/70 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
            />

            {/* Mobile menu */}
            <motion.div
              key="mobile-menu-content"
              className="fixed left-0 right-0 top-16 bottom-0 z-[51] md:hidden border-t bg-background/95 shadow-lg overflow-y-auto navbar-menu"
              aria-label="Mobile navigation menu"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="container py-6 h-full flex flex-col">
                {isLoadingState ? (
                  <div className="pb-6 border-b mb-6">
                    <div className="h-8 w-full">
                      <ClientSkeleton className="h-full w-full rounded-full" />
                    </div>
                  </div>
                ) : !user ? (
                  <div className="pb-6 border-b mb-6">
                    <Link href="/login?redirect=/trips/create">
                      <Button
                        className={cn(
                          'relative overflow-hidden w-full',
                          'lowercase rounded-full',
                          'bg-travel-purple hover:bg-purple-400 text-purple-900',
                          'text-sm px-3 py-1 h-8',
                          'animate-pulse-soft-scale',
                          'before:absolute before:inset-0 before:bg-shimmer-gradient',
                          'before:bg-no-repeat before:bg-200%',
                          'before:animate-shimmer',
                          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-travel-purple'
                        )}
                        onClick={closeMenu}
                      >
                        <span className="relative z-10 flex items-center justify-center">
                          <PlusCircle className="h-3.5 w-3.5 mr-1" />
                          <span>start planning your trip</span>
                        </span>
                      </Button>
                    </Link>
                  </div>
                ) : null}

                <Button
                  variant="outline"
                  size="default"
                  onClick={() => {
                    return openSearch();
                    closeMenu();
                  }}
                  className={cn('mb-6 w-full justify-start')}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>

                <nav className="flex flex-col space-y-6 flex-grow">
                  {!isLoadingState && user && (
                    <>
                      <Link
                        href="/trips"
                        className={`text-sm font-medium transition-colors hover:text-purple-500 lowercase ${
                          isActive('/trips') ? 'text-foreground' : 'text-muted-foreground'
                        }`}
                        onClick={closeMenu}
                      >
                        My Trips
                      </Link>
                    </>
                  )}

                  {/* Add Destinations link to mobile menu */}
                  <Link
                    href="/destinations"
                    className={`text-sm font-medium transition-colors hover:text-purple-500 lowercase ${
                      isActive('/destinations') ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                    onClick={closeMenu}
                  >
                    Destinations
                  </Link>

                  {/* Add Itineraries link to mobile menu */}
                  <Link
                    href="/itineraries"
                    className={`text-sm font-medium transition-colors hover:text-purple-500 lowercase ${
                      isActive('/itineraries') ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                    onClick={closeMenu}
                  >
                    Itineraries
                  </Link>

                  <Link
                    href="/support"
                    className={`text-sm font-medium transition-colors hover:text-purple-500 lowercase ${
                      isActive('/support') ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                    onClick={closeMenu}
                  >
                    support us
                  </Link>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-medium lowercase">Theme</span>
                    <Button variant="ghost" size="icon" onClick={toggleTheme}>
                      {theme === 'dark' ? (
                        <Sun className="h-5 w-5" />
                      ) : (
                        <Moon className="h-5 w-5" />
                      )}
                      <span className="sr-only">Toggle theme</span>
                    </Button>
                  </div>

                  <div className="flex-grow"></div>

                  {isLoadingState ? (
                    <div className="pt-4 mt-auto border-t">
                      <div className="flex items-center gap-3 p-2">
                        <div className="h-9 w-9">
                          <ClientSkeleton className="h-full w-full rounded-full" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="h-4 w-24">
                            <ClientSkeleton className="h-full w-full rounded" />
                          </div>
                          <div className="h-3 w-16">
                            <ClientSkeleton className="h-full w-full rounded" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    user && (
                      <div className="pt-4 mt-auto border-t">
                        <Link
                          href={PAGE_ROUTES.SETTINGS}
                          className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
                          onClick={closeMenu}
                        >
                          <Avatar className="h-9 w-9">
                            <AvatarImage
                              src={user.user_metadata?.avatar_url || ''}
                              alt={user?.email || 'User'}
                            />
                            <AvatarFallback>
                              {user?.email?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col text-sm">
                            <span className="font-medium truncate">{user?.email}</span>
                            <span className="text-muted-foreground">view account</span>
                          </div>
                        </Link>
                      </div>
                    )
                  )}

                  {!isLoadingState && user && (
                    <div className="pt-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sm font-medium text-destructive lowercase p-2 hover:bg-destructive/10 focus:bg-destructive/10"
                        onClick={() => {
                          return handleSignOut();
                          closeMenu();
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        log out
                      </Button>
                    </div>
                  )}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
