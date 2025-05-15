/**
 * FullBleedSection
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