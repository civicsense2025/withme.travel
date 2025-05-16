import Link from 'next/link';
import { Button } from '@/components/ui/button';
import React from 'react';

export function NavbarAuthButtons() {
  return (
    <div className="flex items-center gap-2">
      <Link href="/login" passHref>
        <Button variant="ghost" className="px-4">
          Log In
        </Button>
      </Link>
      <Link href="/signup" passHref>
        <Button variant="default" className="px-4 font-semibold">
          Sign Up
        </Button>
      </Link>
    </div>
  );
}
