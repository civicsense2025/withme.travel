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
import { NavbarUserMenu } from './NavbarUserMenu';
import { useAuth } from '@/lib/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export default function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="w-full bg-background standard-border-b sticky top-0 z-40 text-base md:text-lg lg:text-xl">
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 h-24 flex items-center w-full">
        {/* Left: Logo */}
        <div className="shrink-0 flex items-center">
          <NavbarLogo />
        </div>
        {/* Center: Links */}
        <div className="flex-1 flex justify-center items-center">
          <div className="hidden md:flex flex-col w-full items-center">
            <div className="flex items-center justify-center w-full">
              <NavbarLinks activePath={pathname ?? undefined} user={user ?? undefined} />
              {user && <NavbarStartPlanningDropdown />}
            </div>
          </div>
        </div>
        {/* Right: Auth/Theme Controls */}
        <div className="shrink-0 flex items-center gap-2">
          <NavbarThemeToggle />
          <div className="hidden md:flex items-center gap-2">
            {user ? <NavbarUserMenu /> : <NavbarAuthButtons />}
          </div>
          <div className="md:hidden">
            <NavbarMobileMenuButton onClick={() => setMobileOpen(true)} />
          </div>
        </div>
      </div>
      <NavbarMobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        user={user ?? undefined}
        signOut={signOut}
        activePath={pathname ?? undefined}
      />
    </header>
  );
}
