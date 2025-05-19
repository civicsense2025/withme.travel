import React from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavbarThemeToggle } from './NavbarThemeToggle';
import UserMenu from './UserMenu';
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
    <div className="fixed inset-0 z-[9999] flex justify-end md:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      {/* Slide-in Menu Panel */}
      <div className="relative w-4/5 max-w-xs h-screen bg-background border-l border-border flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Close Button - Top right */}
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Menu Items */}
        <div className="flex flex-col h-full px-6 pt-8 pb-6">
          <div className="overflow-y-auto">
            {user && (
              <div>
                <UserMenu topPosition />
              </div>
            )}
            
            <nav className="flex flex-col gap-4 mt-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-base font-medium',
                    activePath === link.href ? 'text-primary' : 'text-muted-foreground'
                  )}
                  onClick={onClose}
                  legacyBehavior>
                  {link.label}
                </Link>
              ))}
            </nav>
            
            <div className="mt-6 flex items-center">
              <NavbarThemeToggle mobileStyling={true} />
            </div>
          </div>
          
          {user ? (
            <button
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 text-base shadow-lg border-none focus:outline-none focus:ring-2 focus:ring-red-400 mt-auto"
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
                className="w-full bg-travel-purple text-purple-900 hover:bg-purple-300 font-medium py-3 rounded-xl flex items-center justify-center gap-2 text-base shadow-lg border-none focus:outline-none focus:ring-2 focus:ring-purple-400"
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
