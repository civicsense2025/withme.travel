/**
 * FullBleedSection
 *
 * A section that stretches content edge-to-edge, with optional background and padding.
 * Use for hero, feature, or CTA sections that need to break out of the standard container.
 *
 * @module ui/features/core/atoms/FullBleedSection
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

/**
 * A full-width section component that breaks out of container constraints
 * to create visual impact for heroes, feature sections, and CTAs.
 */
export function FullBleedSection({
  children,
  backgroundClassName = '',
  className = '',
  paddingClassName = 'py-16',
  id,
}: FullBleedSectionProps) {
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