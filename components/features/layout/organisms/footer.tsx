'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/hooks/use-auth';
import { Logo } from '@/components/features/ui/logo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { FooterLogoAndSubscribe } from '@/components/layout/FooterLogoAndSubscribe';
import { FooterExploreLinks } from '@/components/layout/FooterExploreLinks';
import { FooterCompanyLinks } from '@/components/layout/FooterCompanyLinks';
import { FooterSocials } from '@/components/layout/FooterSocials';
import { FooterCopyright } from '@/components/layout/FooterCopyright';

export function Footer() {
  const { user } = useAuth();
  // Access admin status safely to avoid type errors
  const isAdmin = !!user && (user as any).app_metadata?.role === 'admin';
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
  const continents = ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'];

  // Navigate items for Explore section
  const exploreLinks = [
    { href: '/destinations', label: 'Destinations' },
    { href: '/itineraries', label: 'Itineraries' },
    { href: '/trips/create', label: 'Plan a Trip' },
  ];
  if (user) {
    exploreLinks.push({ href: '/trips', label: 'My Trips' });
  }

  const companyLinks = [
    { href: '/support', label: 'Support Us' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/privacy', label: 'Privacy Policy' },
  ];
  if (isAdmin) {
    companyLinks.push({ href: '/admin', label: 'Admin' });
  }

  return (
    <footer className="w-full bg-background standard-border-t">
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2 md:pr-20">
            <FooterLogoAndSubscribe />
          </div>
          <FooterExploreLinks user={user ?? undefined} />
          <FooterCompanyLinks isAdmin={isAdmin} />
        </div>
        <div className="mt-12 pt-6 standard-border-t flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4">
          <FooterCopyright />
          <FooterSocials />
        </div>
      </div>
    </footer>
  );
}
