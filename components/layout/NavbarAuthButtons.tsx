import Link from 'next/link';
import { Button } from '@/components/ui/button';
import React from 'react';
import { cn } from '@/utils/lib-utils';
import { useMediaQuery } from '@/lib/hooks/use-media-query';

export function NavbarAuthButtons() {
  return (
    <div className="flex items-center gap-2">
      <Link href="/login" passHref>
        <Button variant="ghost" className={cn(
          'px-4',
          useMediaQuery('(max-width: 640px)') ? 'text-base' : '',
          useMediaQuery('(min-width: 641px) and (max-width: 1024px)') ? 'text-lg' : '',
          useMediaQuery('(min-width: 1025px)') ? 'text-xl' : ''
        )}>
          Log In
        </Button>
      </Link>
      <Link href="/signup" passHref>
        <Button variant="primary" className={cn(
          'px-4 font-semibold',
          useMediaQuery('(max-width: 640px)') ? 'text-base' : '',
          useMediaQuery('(min-width: 641px) and (max-width: 1024px)') ? 'text-lg' : '',
          useMediaQuery('(min-width: 1025px)') ? 'text-xl' : ''
        )}>
          Sign Up
        </Button>
      </Link>
    </div>
  );
}
