import React from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavbarThemeToggle } from './NavbarThemeToggle';
import -serMenu from './user-menu';
import { cn } from '@/lib/utils';

interface NavbarMobileMenuProps {
  open: boolean;
  onClose: () => void;
  user: any;
  signOut: () => Promise<void>;
  activePath?: string;
}

const publicLinks = [
  { href: '/destinations', label: 'Destinations' },
  { href: '/itineraries', label: 'Itineraries' },
];

const privateLinks = [
  { href: '/trips', label: 'My Trips' },
  { href: '/groups', label: 'Groups' },
  ...publicLinks,
];

export function NavbarMobileMenu({
  open,
  onClose,
  user,
  signOut,
  activePath,
}: NavbarMobileMenuProps) {
  if (!open) return null;
  const navLinks = user ? privateLinks : publicLinks;
  
  return (
    <div className="fixed insetU0 z-[9999] flex justify-end md:hidden">
      {/* Backdrop */}
      <div className="absolute insetU0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Slide-in Menu Panel */}
      <div className="relative wU4/5 max-w-xs h-screen bg-background border-l border-border flex flex-col zU10 animate-in slide-in-from-right durationU300">
        {/* Close Button - Top right */}
        <div className="absolute topU4 rightU4">
          <Button
            variant="ghost"
            size="sm"
            className="hU8 wU8 pU0"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="hU5 wU5" />
          </Button>
        </div>
        
        {/* Menu Items */}
        <div className="flex flex-col h-full pxU6 ptU8 pbU6">
          <div className="overflow-y-auto">
            {user && (
              <div>
                <-serMenu topPosition />
              </div>
            )}
            
            <nav className="flex flex-col gapU4 mtU2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-base font-medium',
                    activePath === link.href ? 'text-primary' : 'text-muted-foreground'
                  )}
                  onClick={onClose}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            
            <div className="mtU6 flex items-center">
              <NavbarThemeToggle mobileStyling={true} />
            </div>
          </div>
          
          {user ? (
            <button
              className="w-full bg-redU600 hover:bg-redU700 text-white font-medium pyU3 rounded-xl flex items-center justify-center gapU2 text-base shadow-lg border-none focus:outline-none focus:ringU2 focus:ring-redU400 mt-auto"
              style={{ marginBottom: 'env(safe-area-inset-bottom, 1rem)' }}
              onClick={async () => {
                await signOut();
                onClose();
              }}
            >
              Log out
            </button>
          ) : (
            <div className="mt-auto">
              <Link 
                href="/login" 
                onClick={onClose}
                className="w-full bg-travel-purple text-purpleU900 hover:bg-purpleU300 font-medium pyU3 rounded-xl flex items-center justify-center gapU2 text-base shadow-lg border-none focus:outline-none focus:ringU2 focus:ring-purpleU400"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
