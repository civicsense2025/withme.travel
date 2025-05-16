import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function NavbarStartPlanningDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          className="rounded-full font-semibold px-6 py-5 bg-travel-purple text-purple-900 hover:bg-purple-300 transition-colors"
        >
          Start Planning
          <ChevronDown className="h-4 w-4 ml-1 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild className="py-3 cursor-pointer">
          <Link href="/trips/create">Plan a Trip</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="py-3 cursor-pointer">
          <Link href="/groups/create">Form a Group</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
