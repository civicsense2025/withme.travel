'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export function NavbarLogo() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
        <div className="h-6 w-24 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  return (
    <Link href="/" className="flex items-center space-x-2">
      <div className="relative h-8 w-8">
        <Image
          src={theme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'}
          alt="WithMe Logo"
          fill
          className="h-full w-full"
        />
      </div>
      <span className="hidden font-bold sm:inline-block">WithMe</span>
    </Link>
  );
}
