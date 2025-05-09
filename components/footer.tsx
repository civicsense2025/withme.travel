'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/hooks/use-auth';
import { Logo } from '@/components/logo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function Footer() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would integrate with a service like Plunk here
    // For now, we'll just simulate a successful subscription
    if (email) {
      setSubscribed(true);
      // Reset after 3 seconds
      setTimeout(() => {
        setEmail('');
        setSubscribed(false);
      }, 3000);
    }
  };

  // List of continents
  const continents = [
    'Africa',
    'Asia',
    'Europe',
    'North America',
    'South America',
    'Oceania',
  ];

  // Navigate items for Explore section
  const exploreLinks = [
    { href: '/destinations', label: 'Destinations' },
    { href: '/itineraries', label: 'Itineraries' },
    { href: '/trips/create', label: 'Plan a Trip' },
  ];
  if (user) {
    exploreLinks.push({ href: '/trips', label: 'My Trips' });
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
    <footer className="w-full bg-background standard-border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo and subscribe section */}
          <div className="md:col-span-2 space-y-6">
            <Logo />
            <p className="text-sm text-muted-foreground max-w-md">
              Plan trips with friends without the chaos. Make group travel fun again.
            </p>
            
            {/* Email subscription form */}
            <div className="pt-4">
              <h3 className="text-sm font-medium mb-2">Get travel inspiration</h3>
              <form onSubmit={handleSubscribe} className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 max-w-md">
                <div className="flex-grow">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    className="rounded-full w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={subscribed}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="rounded-full"
                  disabled={subscribed}
                >
                  {subscribed ? (
                    <motion.span
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="flex items-center"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" /> Subscribed
                    </motion.span>
                  ) : (
                    <>Subscribe <ArrowRight className="ml-1 h-4 w-4" /></>
                  )}
                </Button>
              </form>
              <p className="text-xs text-muted-foreground mt-2">
                We respect your privacy and will never share your email.
              </p>
            </div>
          </div>

          {/* Links section */}
          <div className="space-y-6">
            <h3 className="text-sm font-medium">Explore</h3>
            <ul className="space-y-2">
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
            </ul>
          </div>

          {/* Continents section */}
          <div className="space-y-6">
            <h3 className="text-sm font-medium">Continents</h3>
            <ul className="space-y-2">
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
        </div>

        <div className="mt-12 pt-6 standard-border-t flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <p className="text-xs text-muted-foreground lowercase">
              © {new Date().getFullYear()} withme.travel. all rights reserved.
            </p>
            <div className="flex gap-4">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors lowercase"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              href="https://twitter.com/withmetravel"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Twitter"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
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
              aria-label="Instagram"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
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
