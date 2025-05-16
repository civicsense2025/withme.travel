/**
 * ThemeToggle Component
 * 
 * A toggle button that switches between light and dark themes.
 */

// ============================================================================
// IMPORTS
// ============================================================================

'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useThemeSync } from '@/components/theme-provider';

// ============================================================================
// TYPES
// ============================================================================

/** Valid theme options */
export type Theme = 'light' | 'dark';

/** Props for the ThemeToggle component */
export interface ThemeToggleProps {
  /** Display only emoji without label */
  emojiOnly?: boolean;
  /** Button style variant */
  variant?: 'ghost' | 'outline';
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the current system theme preference
 */
function getSystemTheme(): Theme {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

/**
 * Get the initial theme from localStorage or system preferences
 */
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return getSystemTheme();
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ThemeToggle - A button to toggle between light and dark themes
 * 
 * @example
 * <ThemeToggle />
 * 
 * @example
 * <ThemeToggle emojiOnly variant="outline" />
 */
export function ThemeToggle({ 
  emojiOnly, 
  variant = 'ghost' 
}: ThemeToggleProps = {}) {
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

export default ThemeToggle; 