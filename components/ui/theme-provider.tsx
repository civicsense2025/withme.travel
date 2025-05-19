"use client";

import * as React from 'react'
import { ThemeProvider as NextThemeProvider, useTheme } from 'next-themes'

/**
 * Unified ThemeProvider component that works in both the app and Storybook.
 * This uses next-themes under the hood but ensures consistent behavior across environments.
 */
export function ThemeProvider({ children, ...props }: { children: React.ReactNode, [key: string]: any }) {
  const [mounted, setMounted] = React.useState(false);
  
  // Hydration fix: Only render the theme provider's effects after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="withme-theme" // Use a specific key that both app and Storybook can reference
      {...props}
    >
      {/* Use a wrapper div to avoid nested provider hydration issues */}
      {mounted ? children : (
        <div style={{ visibility: 'hidden' }}>{children}</div>
      )}
    </NextThemeProvider>
  )
}

/**
 * Export a custom hook for theme management.
 * This can be used consistently across the app and in Storybook addons/decorators.
 */
export const useThemeSync = () => {
  // Use the next-themes useTheme hook
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme()
  
  const toggleTheme = React.useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }, [resolvedTheme, setTheme])
  
  return {
    theme,
    setTheme,
    resolvedTheme,
    systemTheme,
    toggleTheme,
    isDark: resolvedTheme === 'dark'
  }
}

/**
 * Hook to check if the component is mounted (client-side only).
 * Use this in components that depend on theme to avoid hydration mismatches.
 */
export function useThemeMounted(): boolean {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted;
} 