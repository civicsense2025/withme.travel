import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'wide' | 'full';
  glass?: boolean;
  as?: 'div' | 'section' | 'article' | 'main' | 'header' | 'footer';
  role?: string;
  id?: string;
}

/**
 * Container component that provides consistent layout containers with various sizing options
 * to match the Apple-inspired design system
 *
 * By default, uses a narrower max-width (max-w-screen-md) for main body content,
 * unless size is set to 'full' or 'wide'. This keeps content readable and focused.
 */
export function Container({
  children,
  className,
  size = 'md', // default to narrower width
  glass = false,
  as: Component = 'div',
  role,
  id,
}: ContainerProps) {
  // Check if the className indicates a need for fullscreen layout
  const needsFullscreen =
    size === 'full' && Boolean(className && className.includes('p-0 m-0 max-w-none'));

  return (
    <Component
      className={cn(
        // Width and padding classes
        size === 'full'
          ? 'w-full max-w-none px-0' // No padding/margins for full size
          : 'w-full mx-auto px-4 sm:px-6 md:px-8',

        // Size variant classes
        {
          'max-w-screen-sm': size === 'sm',
          'max-w-screen-md': size === 'md', // default
          'max-w-screen-lg': size === 'lg',
          'max-w-screen-xl': size === 'xl',
          'max-w-[2000px]': size === 'wide',
          'max-w-none': size === 'full',
          'fullscreen-layout': needsFullscreen,
          'backdrop-blur-sm bg-background/80 dark:bg-background/60': glass,
        },

        // User provided classes
        className
      )}
      role={role}
      id={id}
    >
      {children}
    </Component>
  );
}
