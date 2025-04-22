"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, PlusCircle, LogOut, Settings, User, Map, Moon, Sun, Search } from "lucide-react"
import { motion } from "framer-motion"

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
import { createClient } from "@/utils/supabase/client"
import { useTheme } from "next-themes"
import { Logo } from "@/components/logo"
import { useSearch } from "@/contexts/search-context"

export function Navbar() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const { theme, setTheme } = useTheme()
  const { openSearch } = useSearch()

  useEffect(() => {
    async function getUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        setUser(user)

        if (user) {
          // Check if user is admin
          const { data } = await supabase.from("users").select("is_admin").eq("id", user.id).single()
          setIsAdmin(!!data?.is_admin)
        }
      } catch (error) {
        console.error("Error getting user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
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
    <header className="sticky top-0 z-40 border-b bg-background backdrop-blur-sm bg-opacity-80">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-8">
          <Logo />

          <nav className="hidden md:flex gap-6">
            {user && (
              <Link
                href="/trips"
                className={`text-sm font-medium transition-colors hover:text-travel-purple lowercase ${
                  isActive("/trips") ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                my trips
              </Link>
            )}
            <Link
              href="/destinations"
              className={`text-sm font-medium transition-colors hover:text-travel-purple lowercase ${
                isActive("/destinations") ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              destinations
            </Link>
            <Link
              href="/itineraries"
              className={`text-sm font-medium transition-colors hover:text-travel-purple lowercase ${
                isActive("/itineraries") ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              itineraries
            </Link>
            <Link
              href="/support"
              className={`text-sm font-medium transition-colors hover:text-travel-purple lowercase ${
                isActive("/support") ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              support us
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={openSearch}
            aria-label="Open search menu"
            className="h-8 w-8 rounded-full"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Only show theme toggle on desktop */}
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          {!isLoading && (
            <>
              {user ? (
                <div className="flex items-center gap-4">
                  <Link href="/trips/create" className="hidden md:block">
                    <Button className="lowercase rounded-full bg-travel-purple hover:bg-purple-400 text-purple-900">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      plan a trip
                    </Button>
                  </Link>

                  <Link href="/trips/create" className="md:hidden">
                    <Button
                      size="sm"
                      className="lowercase rounded-full bg-travel-purple hover:bg-purple-400 text-purple-900"
                    >
                      plan a trip
                    </Button>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.user_metadata?.avatar_url || ""} alt={user.email || 'User'} />
                          <AvatarFallback>{user.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 rounded-xl" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal lowercase">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user.user_metadata?.name || user.email}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
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
                          <Link href="/settings">
                            <User className="mr-2 h-4 w-4" />
                            <span className="lowercase">profile</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/settings">
                            <Settings className="mr-2 h-4 w-4" />
                            <span className="lowercase">settings</span>
                          </Link>
                        </DropdownMenuItem>
                        {isAdmin && (
                          <DropdownMenuItem asChild>
                            <Link href="/admin">
                              <Settings className="mr-2 h-4 w-4" />
                              <span className="lowercase">admin dashboard</span>
                            </Link>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span className="lowercase">log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/login?redirect=/trips/create">
                    <Button className="lowercase rounded-full bg-travel-purple hover:bg-purple-400 text-purple-900">
                      plan a trip
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}

          <button className="block md:hidden" onClick={toggleMenu}>
            <span className="sr-only">Toggle menu</span>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <motion.div
          className="md:hidden border-t"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="container py-4 space-y-4">
            <nav className="flex flex-col space-y-4">
              {user && (
                <Link
                  href="/trips"
                  className={`text-sm font-medium transition-colors hover:text-travel-purple lowercase ${
                    isActive("/trips") ? "text-foreground" : "text-muted-foreground"
                  }`}
                  onClick={closeMenu}
                >
                  my trips
                </Link>
              )}
              <Link
                href="/destinations"
                className={`text-sm font-medium transition-colors hover:text-travel-purple lowercase ${
                  isActive("/destinations") ? "text-foreground" : "text-muted-foreground"
                }`}
                onClick={closeMenu}
              >
                destinations
              </Link>
              <Link
                href="/itineraries"
                className={`text-sm font-medium transition-colors hover:text-travel-purple lowercase ${
                  isActive("/itineraries") ? "text-foreground" : "text-muted-foreground"
                }`}
                onClick={closeMenu}
              >
                itineraries
              </Link>
              <Link
                href="/support"
                className={`text-sm font-medium transition-colors hover:text-travel-purple lowercase ${
                  isActive("/support") ? "text-foreground" : "text-muted-foreground"
                }`}
                onClick={closeMenu}
              >
                support us
              </Link>
              {!user && (
                <Link
                  href="/login"
                  className={`text-sm font-medium transition-colors hover:text-travel-purple lowercase`}
                  onClick={closeMenu}
                >
                  log in
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/admin"
                  className={`text-sm font-medium transition-colors hover:text-travel-purple lowercase ${
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
      )}
    </header>
  )
}
