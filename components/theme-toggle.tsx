'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useThemeSync } from './theme-provider';

// Define allowed theme types
export type Theme = 'light' | 'dark';

function getSystemTheme(): Theme {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return getSystemTheme();
}

export function ThemeToggle({ 
  emojiOnly, 
  variant = 'ghost' 
}: { 
  emojiOnly?: boolean;
  variant?: 'ghost' | 'outline';
} = {}) {
  const { resolvedTheme, toggleTheme } = useThemeSync();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch by waiting for client-side render
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Button variant="ghost" size="icon" className="w-9 px-0 opacity-0" />;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size="icon"
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full transition-colors hover:bg-muted"
            aria-label="Toggle theme"
          >
            <div className="relative h-5 w-5 overflow-hidden flex items-center justify-center">
              <span
                className={`absolute text-xl transition-all duration-300 ease-out ${
                  resolvedTheme === 'dark' ? 'opacity-100 transform-none' : 'opacity-0 -translate-y-2'
                }`}
                aria-hidden="true"
              >
                ☀️
              </span>
              <span
                className={`absolute text-xl transition-all duration-300 ease-out ${
                  resolvedTheme === 'dark' ? 'opacity-0 translate-y-2' : 'opacity-100 transform-none'
                }`}
                aria-hidden="true"
              >
                🌙
              </span>
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">
            {resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
