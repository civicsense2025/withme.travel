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
    <header className="w-full bg-background standard-border-b sticky top-0 z-40">
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <NavbarLogo />
          <div className="hidden md:flex items-center gap-4">
            <NavbarLinks activePath={pathname ?? undefined} user={user ?? undefined} />
            {user ? <NavbarStartPlanningDropdown /> : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
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
