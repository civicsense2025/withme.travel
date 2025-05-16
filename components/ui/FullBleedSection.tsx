/**
 * FullBleedSection
 *
 * @deprecated Please use the new component at @/components/ui/features/core/atoms/FullBleedSection instead.
 * This component will be removed in a future release.
 * 
 * A section that stretches content edge-to-edge, with optional background and padding.
 * Use for hero, feature, or CTA sections that need to break out of the standard container.
 *
 * @module ui/FullBleedSection
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface FullBleedSectionProps {
  /** Section content */
  children: React.ReactNode;
  /** Optional background color or gradient */
  backgroundClassName?: string;
  /** Optional extra class names */
  className?: string;
  /** Optional vertical padding (default: py-16) */
  paddingClassName?: string;
  /** Section id for anchor links */
  id?: string;
}

export function FullBleedSection({
  children,
  backgroundClassName = '',
  className = '',
  paddingClassName = 'py-16',
  id,
}: FullBleedSectionProps) {
  console.warn('FullBleedSection is deprecated. Please use the new component at @/components/ui/features/core/atoms/FullBleedSection instead.');
  
  return (
    <section
      id={id}
      className={cn(
        'w-full',
        backgroundClassName,
        paddingClassName,
        className
      )}
    >
      {children}
    </section>
  );
} 