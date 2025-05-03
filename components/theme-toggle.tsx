'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function ThemeToggle() {
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
            <div className="relative h-4 w-4 overflow-hidden">
              <Sun
                className={`h-4 w-4 absolute top-0 left-0 transition-all duration-300 ease-out ${
                  theme === 'dark' ? 'opacity-100 transform-none' : 'opacity-0 -translate-y-2'
                }`}
              />
              <Moon
                className={`h-4 w-4 absolute top-0 left-0 transition-all duration-300 ease-out ${
                  theme === 'dark' ? 'opacity-0 translate-y-2' : 'opacity-100 transform-none'
                }`}
              />
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
