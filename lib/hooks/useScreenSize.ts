import React, { useState, useEffect } from 'react';
import {
  MOBILE_MAX_WIDTH,
  TABLET_MAX_WIDTH,
  LayoutType,
} from '@/utils/constants/ui/groupCirclesConstants'; // Adjust path

interface ScreenSizeInfo {
  width: number;
  layout: LayoutType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export function useScreenSize(): ScreenSizeInfo {
  const [width, setWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : TABLET_MAX_WIDTH + 1
  ); // Default to desktop

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  let layout: LayoutType = 'desktop';
  if (width <= MOBILE_MAX_WIDTH) {
    layout = 'mobile';
  } else if (width <= TABLET_MAX_WIDTH) {
    layout = 'tablet';
  }

  return {
    width,
    layout,
    isMobile: layout === 'mobile',
    isTablet: layout === 'tablet',
    isDesktop: layout === 'desktop',
  };
}
