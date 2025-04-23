"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, PlusCircle, LogOut, Settings, User, Map, Moon, Sun, Search, Bookmark } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip"
import { createClient } from "@/utils/supabase/client"
import { useTheme } from "next-themes"
import { Logo } from "@/components/logo"
import { useSearch } from "@/contexts/search-context"
import { useAuth } from "@/components/auth-provider"
import { PAGE_ROUTES, THEME } from "@/utils/constants"

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
  const { user, profile, signOut } = useAuth()
  const isAdmin = profile?.is_admin
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { openSearch } = useSearch()

  const handleSignOut = async () => {
    await signOut()
    // Router push is handled inside signOut function in auth-provider
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

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex h-16 items-center justify-between py-4 px-3 sm:px-4 md:container md:px-6">
        <div className="flex items-center gap-4 md:gap-8">
          <div className="cursor-pointer" onClick={() => router.push("/")}>
            <Logo />
          </div>

          {/* Desktop Navigation - hidden on mobile */}
          <nav className="hidden md:flex gap-6">
            {user && (
              <Link
                href="/trips"
                className={`text-sm font-medium transition-colors hover:text-${THEME.COLORS.PURPLE} lowercase ${
                  isActive("/trips") ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                My Trips
              </Link>
            )}
            <Link
              href={PAGE_ROUTES.DESTINATIONS}
              className={`text-sm font-medium transition-colors hover:text-${THEME.COLORS.PURPLE} lowercase ${
                isActive(PAGE_ROUTES.DESTINATIONS) ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              destinations
            </Link>
            <Link
              href="/itineraries"
              className={`text-sm font-medium transition-colors hover:text-${THEME.COLORS.PURPLE} lowercase ${
                isActive("/itineraries") ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              itineraries
            </Link>
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
          <Link href={user ? "/trips/create" : "/login?redirect=/trips/create"}>
            <ClientOnlyTooltip text={user ? "Plan a new trip" : "You need to log in to plan a trip"}>
              <Button className="lowercase rounded-full bg-travel-purple hover:bg-purple-400 text-purple-900 text-xs sm:text-sm px-2 sm:px-3 py-1 h-7 sm:h-8">
                <PlusCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                <span>new trip</span>
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

          {/* User dropdown - hidden on mobile */}
          {user ? (
            <div className="hidden md:flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url || ""} alt={user.email || 'User'} />
                      <AvatarFallback>{user.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/trips" onClick={closeMenu}>
                        <Map className="mr-2 h-4 w-4" />
                        <span className="lowercase">my trips</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/itineraries" onClick={closeMenu}>
                        <Map className="mr-2 h-4 w-4" />
                        <span className="lowercase">itineraries</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/saved" onClick={closeMenu}>
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
                      <Link href={PAGE_ROUTES.CREATE_TRIP}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        <span className="lowercase">new trip</span>
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <Settings className="mr-2 h-4 w-4" />
                          <span className="lowercase">admin</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span className="lowercase">Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              {/* <Button asChild variant="outline" size="sm">
                <Link href="/login?redirect=/trips/create">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup?redirect=/trips/create">Sign Up</Link>
              </Button> */}
            </div>
          )}
        </div>
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
                {/* If user is logged in, show user info at top of mobile menu */}
                {user && (
                  <div className="flex items-center gap-4 pb-6 border-b mb-6">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.user_metadata?.avatar_url || ""} alt={user.email || 'User'} />
                      <AvatarFallback>{user.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.user_metadata?.name || user.email}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                )}

                {/* Search button - shown only in mobile menu */}
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
                  {user && (
                    <Link
                      href="/trips"
                      className={`text-sm font-medium transition-colors hover:text-${THEME.COLORS.PURPLE} lowercase ${
                        isActive("/trips") ? "text-foreground" : "text-muted-foreground"
                      }`}
                      onClick={closeMenu}
                    >
                      My Trips
                    </Link>
                  )}
                  {user && (
                    <Link
                      href="/saved"
                      className={`text-sm font-medium transition-colors hover:text-${THEME.COLORS.PURPLE} lowercase ${
                        isActive("/saved") ? "text-foreground" : "text-muted-foreground"
                      }`}
                      onClick={closeMenu}
                    >
                      <Bookmark className="inline-block mr-1 h-3.5 w-3.5" />
                      Saved Items
                    </Link>
                  )}
                  <Link
                    href={PAGE_ROUTES.DESTINATIONS}
                    className={`text-sm font-medium transition-colors hover:text-travel-purple lowercase ${
                      isActive(PAGE_ROUTES.DESTINATIONS) ? "text-foreground" : "text-muted-foreground"
                    }`}
                    onClick={closeMenu}
                  >
                    destinations
                  </Link>
                  <Link
                    href="/itineraries"
                    className={`text-sm font-medium transition-colors hover:text-${THEME.COLORS.PURPLE} lowercase ${
                      isActive("/itineraries") ? "text-foreground" : "text-muted-foreground"
                    }`}
                    onClick={closeMenu}
                  >
                    itineraries
                  </Link>
                  <Link
                    href="/support"
                    className={`text-sm font-medium transition-colors hover:text-${THEME.COLORS.PURPLE} lowercase ${
                      isActive("/support") ? "text-foreground" : "text-muted-foreground"
                    }`}
                    onClick={closeMenu}
                  >
                    support us
                  </Link>
                  {!user && (
                    <>
                      {/* Remove these from mobile menu as well */}
                      {/* <Link
                        href="/login?redirect=/trips/create"
                        className={`text-sm font-medium transition-colors hover:text-${THEME.COLORS.PURPLE} lowercase ${
                          isActive("/login") ? "text-foreground" : "text-muted-foreground"
                        }`}
                        onClick={closeMenu}
                      >
                        log in
                      </Link>
                      <Link
                        href="/signup?redirect=/trips/create"
                        className={`text-sm font-medium transition-colors hover:text-${THEME.COLORS.PURPLE} lowercase ${
                          isActive("/signup") ? "text-foreground" : "text-muted-foreground"
                        }`}
                        onClick={closeMenu}
                      >
                        sign up
                      </Link> */}
                    </>
                  )}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className={`text-sm font-medium transition-colors hover:text-${THEME.COLORS.PURPLE} lowercase ${
                        isActive("/admin") ? "text-foreground" : "text-muted-foreground"
                      }`}
                      onClick={closeMenu}
                    >
                      admin dashboard
                    </Link>
                  )}

                  {/* Theme toggle in mobile menu */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-medium lowercase">Theme</span>
                    <Button variant="ghost" size="icon" onClick={toggleTheme}>
                      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                      <span className="sr-only">Toggle theme</span>
                    </Button>
                  </div>

                  {/* Spacer to push logout to bottom */}
                  <div className="flex-grow"></div>

                  {/* Log out button at bottom for logged in users */}
                  {user && (
                    <div className="pt-4 mt-4 border-t">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sm font-medium text-destructive lowercase"
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
