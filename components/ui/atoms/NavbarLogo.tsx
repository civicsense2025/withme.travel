import { useMediaQuery } from '@/lib/hooks/use-media-query';
import Link from 'next/link';
import React from 'react';

export function NavbarLogo() {
  return (
    <Link
      href="/"
      className={`font-extrabold flex items-center tracking-tight leading-none select-none mr-16 ${
        useMediaQuery('(max-width: 640px)') ? 'text-2xl' : ''
      } ${
        useMediaQuery('(min-width: 641px) and (max-width: 1024px)') ? 'text-3xl' : ''
      } ${
        useMediaQuery('(min-width: 1025px)') ? 'text-4xl' : ''
      }`}
      style={{ letterSpacing: '-0.03em' }}
      aria-label="withme.travel home"
    >
      withme.
    </Link>
  );
}
