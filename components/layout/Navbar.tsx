'use client';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { NavbarLogo } from './NavbarLogo';
import { NavbarLinks } from './NavbarLinks';
import { NavbarThemeToggle } from './NavbarThemeToggle';
import { NavbarStartPlanningDropdown } from './NavbarStartPlanningDropdown';
import { NavbarMobileMenuButton } from './NavbarMobileMenuButton';
import { NavbarMobileMenu } from './NavbarMobileMenu';
import { NavbarAuthButtons } from './NavbarAuthButtons';
import UserMenu from '@/components/layout/UserMenu';
import { useAuth } from '@/lib/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useMediaQuery } from '@/lib/hooks/use-media-query';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  return (
    <header className="w-full bg-background standard-border-b sticky top-0 z-40 text-base md:text-lg lg:text-xl">
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 h-16 md:h-20 lg:h-24 flex items-center w-full transition-all duration-200">
        {/* Left: Logo */}
        <div className="shrink-0 flex items-center px-2">
          <NavbarLogo />
        </div>
        
        {/* Center: Links - Render based on isDesktop */}
        {isDesktop ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="flex w-full justify-center">
              <NavbarLinks activePath={pathname ?? undefined} user={user ?? undefined} />
            </div>
          </div>
        ) : (
          // Placeholder for mobile to maintain layout balance, or remove if not needed
          <div className="flex-1" />
        )}
        
        {/* Right: Auth + Theme + Planning */}
        <div className="shrink-0 flex items-center gap-1 md:gap-2 px-2">
          {/* Desktop layout */}
          {isDesktop && (
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <NavbarStartPlanningDropdown />
                  <NavbarThemeToggle />
                  <UserMenu />
                </>
              ) : (
                <>
                  <NavbarAuthButtons />
                  <NavbarThemeToggle />
                </>
              )}
            </div>
          )}
          
          {/* Mobile layout */}
          {!isDesktop && (
            <div className="flex items-center gap-2">
              <NavbarThemeToggle mobileStyling={true} />
              <NavbarMobileMenuButton onClick={() => setMobileOpen(true)} />
            </div>
          )}
        </div>
      </div>
      
      {/* Conditionally render NavbarMobileMenu based on isDesktop */}
      {!isDesktop && (
        <NavbarMobileMenu
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          user={user ?? undefined}
          signOut={logout}
          activePath={pathname ?? undefined}
        />
      )}
    </header>
  );
}
