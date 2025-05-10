import type React from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'wide' | 'full';
}

export function Container({ children, className, size = 'lg' }: ContainerProps) {
  // Check if the className indicates a need for fullscreen layout
  const needsFullscreen = size === 'full' && Boolean(className && className.includes('p-0 m-0 max-w-none'));
  
  return (
    <div
      className={cn(
        size === 'full'
          ? 'w-full max-w-none px-0' // No padding/margins for full size
          : 'w-full mx-auto px-4 sm:px-6 md:px-8',
        {
          'max-w-screen-sm': size === 'sm',
          'max-w-screen-md': size === 'md',
          'max-w-screen-lg': size === 'lg',
          'max-w-screen-xl': size === 'xl',
          'max-w-[2000px]': size === 'wide',
          'max-w-none': size === 'full',
          'fullscreen-layout': needsFullscreen, // Using the boolean variable now
        },
        className
      )}
    >
      {children}
    </div>
  );
}
