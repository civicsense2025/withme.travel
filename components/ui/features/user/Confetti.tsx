/**
 * @deprecated This component has been moved to components/ui/features/user-testing/atoms/Confetti.tsx
 * Please import from '@/components/ui/features/user-testing/atoms/Confetti' instead.
 * This file will be removed in a future update.
 */

'use client';

import { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';

interface ConfettiProps {
  width?: number;
  height?: number;
  numberOfPieces?: number;
  recycle?: boolean;
  colors?: string[];
  gravity?: number;
  wind?: number;
  opacity?: number;
  run?: boolean;
}

/**
 * A wrapper around react-confetti with SSR safety and window resizing
 * @param props - Configuration for the confetti effect
 */
export function Confetti({
  width,
  height,
  numberOfPieces = 200,
  recycle = false,
  colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'],
  gravity = 0.1,
  wind = 0,
  opacity = 0.9,
  run = true
}: ConfettiProps) {
  // For SSR safety
  const [isMounted, setIsMounted] = useState(false);
  
  // Default props
  const [dimensions, setDimensions] = useState({
    width: width || (typeof window !== 'undefined' ? window.innerWidth : 1200),
    height: height || (typeof window !== 'undefined' ? window.innerHeight : 800)
  });
  
  // Handle window resize
  useEffect(() => {
    setIsMounted(true);
    
    if (!width || !height) {
      // Only add resize listeners if width/height not explicitly set
      const handleResize = () => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [width, height]);
  
  if (!isMounted) return null;
  
  return (
    <ReactConfetti
      width={dimensions.width}
      height={dimensions.height}
      numberOfPieces={numberOfPieces}
      recycle={recycle}
      colors={colors}
      gravity={gravity}
      wind={wind}
      opacity={opacity}
      run={run}
    />
  );
} 