'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function ThemeToggle({ emojiOnly }: { emojiOnly?: boolean } = {}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Mounted state to handle SSR
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
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-8 h-8 rounded-full transition-colors hover:bg-muted"
            aria-label="Toggle theme"
          >
            <div className="relative h-5 w-5 overflow-hidden flex items-center justify-center">
              <span
                className={`absolute text-xl transition-all duration-300 ease-out ${
                  theme === 'dark' ? 'opacity-100 transform-none' : 'opacity-0 -translate-y-2'
                }`}
                aria-hidden="true"
              >
                ☀️
              </span>
              <span
                className={`absolute text-xl transition-all duration-300 ease-out ${
                  theme === 'dark' ? 'opacity-0 translate-y-2' : 'opacity-100 transform-none'
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
            {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
