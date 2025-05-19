import React from 'react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface NavbarThemeToggleProps {
  mobileStyling?: boolean;
}

export function NavbarThemeToggle({ mobileStyling = false }: NavbarThemeToggleProps) {
  return <ThemeToggle variant={mobileStyling ? 'outline' : 'ghost'} />;
}
