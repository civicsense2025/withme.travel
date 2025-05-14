import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavbarMobileMenuButtonProps {
  onClick: () => void;
}

export function NavbarMobileMenuButton({ onClick }: NavbarMobileMenuButtonProps) {
  return (
    <Button variant="ghost" className="p-2" onClick={onClick} aria-label="Open menu">
      <Menu className="h-5 w-5" />
    </Button>
  );
}
