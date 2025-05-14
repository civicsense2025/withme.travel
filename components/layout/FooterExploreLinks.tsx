import Link from 'next/link';
import React from 'react';

interface FooterExploreLinksProps {
  user?: { [key: string]: any };
}

export function FooterExploreLinks({ user }: FooterExploreLinksProps) {
  const exploreLinks = [
    { href: '/groups', label: 'Groups' },
    { href: '/destinations', label: 'Destinations' },
    { href: '/itineraries', label: 'Itineraries' },
    { href: '/trips', label: 'Trips' },
  ];
  if (user) {
    exploreLinks.push({ href: '/trips/manage', label: 'My Trips' });
  }
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-medium">Explore</h3>
      <ul className="space-y-2">
        {exploreLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors capitalize"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
