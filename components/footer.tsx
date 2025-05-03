'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/hooks/use-auth';
import { Logo } from '@/components/logo';

export function Footer() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // List of continents
  const continents = [
    'Africa',
    'Asia',
    'Europe',
    'North America',
    'South America',
    'Oceania',
    'Antarctica'
  ];
  
  // Navigate items for Explore section
  const exploreLinks = [
    { href: '/destinations', label: 'Destinations' },
    { href: '/itineraries', label: 'Itineraries' },
    { href: '/trips/create', label: 'Plan a Trip' },
  ];
  if (user) {
    exploreLinks.push({ href: '/', label: 'My Trips' });
  }

  const companyLinks = [{ href: '/support', label: 'Support Us' }];
  if (isAdmin) {
    companyLinks.push({ href: '/admin', label: 'Admin' });
  }

  const legalLinks = [
    { href: '/terms', label: 'Terms of Service' },
    { href: '/privacy', label: 'Privacy Policy' },
  ];

  return (
    <footer className="bg-muted/30 py-12 text-center">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="grid grid-cols-1 gap-10 items-center">
          <div className="space-y-4 flex flex-col items-center">
            <Logo />
            <p className="text-sm text-muted-foreground max-w-xs">
              Plan trips with friends without the chaos. Make group travel fun again.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-base lowercase">Continents</h3>
            <ul className="space-y-3">
              {continents.map((continent) => (
                <li key={continent}>
                  <Link
                    href={`/continents/${continent.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors lowercase"
                  >
                    {continent.toLowerCase()}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <ul className="space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors lowercase"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors lowercase"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors lowercase"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground lowercase">
            © {new Date().getFullYear()} withme.travel. all rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="https://twitter.com/withmetravel"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="sr-only">Twitter</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-twitter"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </Link>
            <Link
              href="https://instagram.com/withmetravel"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="sr-only">Instagram</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-instagram"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
