import Link from 'next/link';
import React from 'react';

export function NavbarLogo() {
  return (
    <Link
      href="/"
      className="font-extrabold text-2xl md:text-2xl lg:text-3xl flex items-center tracking-tight leading-none select-none"
      style={{ letterSpacing: '-0.03em' }}
      aria-label="withme.travel home"
    >
      withme.
    </Link>
  );
}
