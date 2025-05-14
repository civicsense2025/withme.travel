import Link from 'next/link';
import React from 'react';
import { cn } from '@/lib/utils';

export interface NavbarLinksProps {
  activePath?: string;
  user?: { [key: string]: any };
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

export function NavbarLinks({ activePath, user }: NavbarLinksProps) {
  const links = user ? privateLinks : publicLinks;
  return (
    <nav className="flex items-center space-x-6">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            activePath === link.href ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
