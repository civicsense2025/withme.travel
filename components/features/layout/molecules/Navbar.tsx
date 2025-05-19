'use client';

import Link from 'next/link';
import { Logo } from '@/components/features/ui/logo';

export default function Navbar() {
  return (
    <header className="w-full py-4 border-b">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" legacyBehavior>
          <Logo />
          <span className="font-medium">WithMe Travel</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/destinations" className="text-sm hover:text-primary">
            Destinations
          </Link>
          <Link href="/trips" className="text-sm hover:text-primary">
            My Trips
          </Link>
        </nav>
      </div>
    </header>
  );
} 