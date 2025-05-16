/**
 * SectionHeader Component
 * 
 * A reusable component for section headers with title and subtitle.
 */

// ============================================================================
// IMPORTS
// ============================================================================

import React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

/** Layout types for responsive design */
export type LayoutType = 'mobile' | 'tablet' | 'desktop';

/** Props for the SectionHeader component */
export interface SectionHeaderProps {
  /** Title of the section (can include rich content) */
  title: React.ReactNode;
  /** Subtitle or description text */
  subtitle: string;
  /** Layout size for responsive design */
  layout?: LayoutType;
  /** Custom text color for the title */
  textColor?: string;
  /** Custom muted color for the subtitle */
  mutedColor?: string;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * SectionHeader - A header for page sections with title and subtitle
 * 
 * @example
 * <SectionHeader 
 *   title="Features" 
 *   subtitle="Everything you need to create amazing experiences" 
 * />
 */
export function SectionHeader({ 
  title, 
  subtitle, 
  layout = 'desktop',
  textColor = 'var(--foreground)',
  mutedColor = 'var(--muted-foreground)',
  className
}: SectionHeaderProps) {
  return (
    <div 
      className={cn(
        'text-center relative z-10',
        layout === 'mobile' ? 'mb-6' : 'mb-12',
        className
      )}
    >
      <h2 
        className={cn(
          'font-bold mb-2',
          layout === 'mobile' ? 'text-xl' : 'text-3xl'
        )}
        style={{ color: textColor }}
      >
        {title}
      </h2>
      <p 
        className={cn(
          'max-w-[600px] mx-auto',
          layout === 'mobile' ? 'text-sm' : 'text-base'
        )}
        style={{ color: mutedColor }}
      >
        {subtitle}
      </p>
    </div>
  );
}

export default SectionHeader; 