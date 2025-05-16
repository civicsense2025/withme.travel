import Link from 'next/link';
import React from 'react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/lib/hooks/use-media-query';

export interface NavbarLinksProps {
  activePath?: string;
  user?: { [key: string]: any };
}

const getNavbarLinks = (user?: { [key: string]: any }) => [
  { href: user ? '/trips/manage' : '/trips', label: 'Trips' },
  { href: '/destinations', label: 'Destinations' },
  { href: '/itineraries', label: 'Itineraries' },
  { href: user ? '/groups/manage' : '/groups', label: 'Groups' },
];

// Define a type for the link structure
interface NavbarLink {
  href: string;
  label: string;
}

export function NavbarLinks({ activePath, user }: NavbarLinksProps) {
  const links: NavbarLink[] = getNavbarLinks(user);
  return (
    <nav className="flex justify-center items-center w-full space-x-12 pt-8 pb-8 text-center">
      {links.map((link: NavbarLink) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'font-normal transition-colors hover:text-primary',
            activePath === link.href ? 'text-primary' : 'text-muted-foreground',
            useMediaQuery('(max-width: 640px)') ? 'text-base' : '',
            useMediaQuery('(min-width: 641px) and (max-width: 1024px)') ? 'text-lg' : '',
            useMediaQuery('(min-width: 1025px)') ? 'text-xl' : ''
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
