'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface LayoutModeContextType {
  fullscreen: boolean;
  setFullscreen: (fullscreen: boolean) => void;
}

const LayoutModeContext = createContext<LayoutModeContextType>({
  fullscreen: false,
  setFullscreen: () => {},
});

export function LayoutModeProvider({ children }: { children: React.ReactNode }) {
  const [fullscreen, setFullscreen] = useState(false);

  // This effect will help reset fullscreen mode if the component tree crashes
  useEffect(() => {
    return () => {
      // Reset fullscreen on unmount of the provider (e.g., on page refresh/hard navigation)
      setFullscreen(false);
    };
  }, []);

  return (
    <LayoutModeContext.Provider value={{ fullscreen, setFullscreen }}>
      {children}
    </LayoutModeContext.Provider>
  );
}

export function useLayoutMode() {
  const context = useContext(LayoutModeContext);
  if (context === undefined) {
    throw new Error('useLayoutMode must be used within a LayoutModeProvider');
  }
  return context;
}
