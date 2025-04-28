"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, PlusCircle, LogOut, Settings, User, Map, Moon, Sun, Search, Bookmark } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip"
import { useTheme } from "next-themes"
import { Logo } from "@/components/logo"
import { useSearch } from "@/contexts/search-context"
import { useAuth } from "@/lib/hooks/use-auth"
import { PAGE_ROUTES, THEME } from "@/utils/constants"
import { UserNav } from "@/components/layout/user-nav"

// Create a client-only wrapper for the tooltip component
function ClientOnlyTooltip({ children, text }: { children: React.ReactNode, text: string }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return <>{children}</>;
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent>
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, signOut, isLoading } = useAuth()
  const isAdmin = profile?.is_admin
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { openSearch } = useSearch()
  
  // State to track how long loading has been active
  const [loadingDuration, setLoadingDuration] = useState(0)
  
  // Use this ref to track auth state for debugging
  const authStateRef = useRef({
    isLoading,
    hasUser: !!user,
    userId: user?.id,
    profileId: profile?.id
  })
  
  // Update the ref when auth state changes (for debugging)
  useEffect(() => {
    authStateRef.current = {
      isLoading,
      hasUser: !!user,
      userId: user?.id,
      profileId: profile?.id
    }
    
    // Log auth state changes for debugging
    console.log("[Navbar] Auth state updated:", {
      isLoading,
      hasUser: !!user,
      userId: user?.id?.substring(0, 8),
      hasProfile: !!profile
    })
  }, [isLoading, user, profile])
  
  // Set up monitoring for prolonged loading state
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isLoading) {
      // Start a timer when loading begins
      timer = setInterval(() => {
        setLoadingDuration(prev => prev + 500);
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
    console.log("[Navbar] Force refreshing auth state");
    // This could dispatch a custom event that AuthProvider listens for,
    // or reload the page in a worst-case scenario
    
    // Simple approach: reload the page
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }, []);

  const handleSignOut = async () => {
    await signOut()
  }

  const toggleMenu = () => {
    setIsMenuOpen((prevState) => !prevState);
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  // Placeholder for user-specific items while loading
  const LoadingUserNavPlaceholder = () => (
    <div className="flex items-center gap-4">
      <Skeleton className="h-5 w-16 rounded" />
    </div>
  );
  
  const LoadingUserAvatarPlaceholder = () => (
    <Skeleton className="h-8 w-8 rounded-full" />
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 dark:border-border/20 bg-background/95 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between py-4 px-3 sm:px-4 md:px-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 md:gap-8">
          <div className="cursor-pointer" onClick={() => router.push("/")}>
            <Logo />
          </div>

          {/* Desktop Navigation - hidden on mobile */}
          <nav className="hidden md:flex gap-6 items-center">
            {isLoading ? (
               <Skeleton className="h-5 w-16 rounded" /> 
            ) : user ? (
              <>
                <Link
                  href="/trips"
                  className={`text-sm font-medium transition-colors hover:text-${THEME.COLORS.PURPLE} lowercase ${
                    isActive("/trips") ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  My Trips
                </Link>
              </>
            ) : null }
            
            <Link
              href="/support"
              className={`text-sm font-medium transition-colors hover:text-${THEME.COLORS.PURPLE} lowercase ${
                isActive("/support") ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              support us
            </Link>
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
          <Link href={isLoading ? "#" : (user ? "/trips/create" : "/login?redirect=/trips/create")}>
            <ClientOnlyTooltip text={isLoading ? "Loading..." : (user ? "Plan a new trip" : "login to manage your trips")}>
              <Button 
                disabled={isLoading}
                className="
                  relative overflow-hidden
                  lowercase rounded-full 
                  bg-travel-purple hover:bg-purple-400 text-purple-900 
                  text-xs sm:text-sm px-2 sm:px-3 py-1 h-7 sm:h-8 
                  animate-pulse-soft-scale 
                  before:absolute before:inset-0 before:bg-shimmer-gradient 
                  before:bg-no-repeat before:bg-200% 
                  before:animate-shimmer
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-travel-purple
                  disabled:opacity-70 disabled:cursor-not-allowed
                "
              >
                <span className="relative z-10 flex items-center">
                  <PlusCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                  <span>manage my trips</span>
                </span>
              </Button>
            </ClientOnlyTooltip>
          </Link>

          {/* Mobile menu toggle - visible only on mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="h-8 w-8 rounded-full md:hidden"
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>

          {/* User dropdown - hidden on mobile, now using UserNav component */}
          <div className="hidden md:flex items-center gap-4">
            {isLoading ? (
              <LoadingUserAvatarPlaceholder />
            ) : user ? (
              <UserNav />
            ) : null }
          </div>
        </div>

        {/* Add retry button when loading takes too long */}
        {showRetryButton && isLoading && (
          <div className="absolute top-16 left-0 right-0 bg-amber-100 dark:bg-amber-900 p-2 text-center">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              Login status is taking longer than expected. 
              <button 
                onClick={handleForceRefresh}
                className="underline ml-2 font-medium"
              >
                Refresh now
              </button>
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/70 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              key="mobile-menu-backdrop"
            />
            
            {/* Mobile menu */}
            <motion.div
              className="fixed left-0 right-0 top-16 bottom-0 z-[100] md:hidden border-t bg-background/95 shadow-lg overflow-y-auto"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              key="mobile-menu-content"
            >
              <div className="container py-6 h-full flex flex-col">
                {isLoading ? (
                   <div className="pb-6 border-b mb-6">
                     <Skeleton className="h-8 w-full rounded-full" />
                   </div>
                 ) : !user && (
                  <div className="pb-6 border-b mb-6">
                    <Link href="/login?redirect=/trips/create">
                      <Button 
                        className="
                          relative overflow-hidden w-full
                          lowercase rounded-full 
                          bg-travel-purple hover:bg-purple-400 text-purple-900 
                          text-sm px-3 py-1 h-8
                          animate-pulse-soft-scale 
                          before:absolute before:inset-0 before:bg-shimmer-gradient 
                          before:bg-no-repeat before:bg-200% 
                          before:animate-shimmer
                          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-travel-purple
                        "
                        onClick={closeMenu}
                      >
                        <span className="relative z-10 flex items-center justify-center">
                          <PlusCircle className="h-3.5 w-3.5 mr-1" />
                          <span>start planning your trip</span>
                        </span>
                      </Button>
                    </Link>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="default"
                  onClick={() => {
                    openSearch();
                    closeMenu();
                  }}
                  className="mb-6 w-full justify-start"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>

                <nav className="flex flex-col space-y-6 flex-grow">
                   {!isLoading && user && (
                    <>
                      <Link
                        href="/trips"
                        className={`text-sm font-medium transition-colors hover:text-${THEME.COLORS.PURPLE} lowercase ${
                          isActive("/trips") ? "text-foreground" : "text-muted-foreground"
                        }`}
                        onClick={closeMenu}
                      >
                        My Trips
                      </Link>
                    </>
                   )}
                  <Link
                    href="/support"
                    className={`text-sm font-medium transition-colors hover:text-${THEME.COLORS.PURPLE} lowercase ${
                      isActive("/support") ? "text-foreground" : "text-muted-foreground"
                    }`}
                    onClick={closeMenu}
                  >
                    support us
                  </Link>
                  {!isLoading && isAdmin && (
                    <Link
                      href="/admin/dashboard"
                      className={`text-sm font-medium transition-colors hover:text-${THEME.COLORS.PURPLE} lowercase ${
                        isActive("/admin/dashboard") ? "text-foreground" : "text-muted-foreground"
                      }`}
                      onClick={closeMenu}
                    >
                      admin dashboard
                    </Link>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-medium lowercase">Theme</span>
                    <Button variant="ghost" size="icon" onClick={toggleTheme}>
                      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                      <span className="sr-only">Toggle theme</span>
                    </Button>
                  </div>

                  <div className="flex-grow"></div>

                  {isLoading ? (
                    <div className="pt-4 mt-auto border-t">
                      <div className="flex items-center gap-3 p-2">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div className="flex flex-col gap-1">
                           <Skeleton className="h-4 w-24 rounded" />
                           <Skeleton className="h-3 w-16 rounded" />
                        </div>
                      </div>
                    </div>
                  ) : user && (
                    <div className="pt-4 mt-auto border-t">
                      <Link 
                        href={PAGE_ROUTES.SETTINGS}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
                        onClick={closeMenu}
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={profile?.avatar_url || ""} alt={profile?.name || user?.email || 'User'} />
                          <AvatarFallback>{profile?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col text-sm">
                          <span className="font-medium truncate">{profile?.name || user?.email}</span>
                          <span className="text-muted-foreground">view account</span>
                        </div>
                      </Link>
                    </div>
                  )}

                  {!isLoading && user && (
                    <div className={'pt-2'}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sm font-medium text-destructive lowercase p-2 hover:bg-destructive/10 focus:bg-destructive/10"
                        onClick={() => {
                          handleSignOut()
                          closeMenu()
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
  )
}
