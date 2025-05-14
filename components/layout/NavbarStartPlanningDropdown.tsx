import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function NavbarStartPlanningDropdown() {
  return (
    <div className="relative group">
      <Button
        size="sm"
        className="rounded-full h-8 font-semibold px-5 bg-travel-purple text-purple-900 hover:bg-purple-300 transition-colors"
        aria-haspopup="true"
        aria-expanded="false"
      >
        Start Planning
      </Button>
      <div className="absolute left-0 mt-2 w-48 rounded-xl shadow-lg bg-white dark:bg-black border border-border opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto transition-opacity z-50">
        <Link
          href="/trips/create"
          className="block px-5 py-3 text-sm hover:bg-travel-purple/10 rounded-t-xl transition-colors"
        >
          Plan a Trip
        </Link>
        <Link
          href="/groups/create"
          className="block px-5 py-3 text-sm hover:bg-travel-purple/10 rounded-b-xl transition-colors"
        >
          Form a Group
        </Link>
      </div>
    </div>
  );
}
