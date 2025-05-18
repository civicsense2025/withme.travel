/**
 * Page Header
 * 
 * A header component for page sections with title, description, and actions
 * 
 * @module ui/molecules/header
 */

'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { HeaderTitle, HeaderDescription, HeaderActions } from '../../atoms/header';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface PageHeaderProps {
  /** The title to display */
  title?: string;
  /** For backward compatibility */
  heading?: string;
  /** Optional description text */
  description?: string;
  /** Optional action buttons */
  actions?: React.ReactNode;
  /** Whether to center the content */
  centered?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** Children for backward compatibility */
  children?: React.ReactNode;
}

// ============================================================================
// STYLE CONSTANTS
// ============================================================================

// Responsive style for spacing in rems - reduced for mobile
const headerStyle: React.CSSProperties = {
  width: '100%',
  paddingTop: '2.5rem', // 40px - reduced for mobile
  paddingBottom: '2.5rem', // 40px - reduced for mobile
};

// Add a media query for md+ screens (min-width: 768px)
const mdHeaderStyle: React.CSSProperties = {
  paddingTop: '4rem', // 64px for medium screens
  paddingBottom: '4rem',
};

// Add a media query for lg+ screens (min-width: 1024px)
const lgHeaderStyle: React.CSSProperties = {
  paddingTop: '5rem', // 80px for large screens
  paddingBottom: '5rem',
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * A responsive page header component with title, description, and actions
 */
export function PageHeader({
  title,
  heading,
  description,
  actions,
  className,
  centered = false,
  children,
}: PageHeaderProps) {
  // For backward compatibility - use heading if title is not provided
  const displayTitle = title || heading || '';

  // Inline style with media query for rem-based spacing
  const [style, setStyle] = useState<React.CSSProperties>(headerStyle);
  
  useEffect(() => {
    const updateStyle = () => {
      if (window.innerWidth >= 1024) {
        setStyle({ ...headerStyle, ...mdHeaderStyle, ...lgHeaderStyle });
      } else if (window.innerWidth >= 768) {
        setStyle({ ...headerStyle, ...mdHeaderStyle });
      } else {
        setStyle(headerStyle);
      }
    };
    updateStyle();
    window.addEventListener('resize', updateStyle);
    return () => window.removeEventListener('resize', updateStyle);
  }, []);

  return (
    <div className={cn(centered ? 'text-center' : 'text-left', className)} style={style}>
      <div
        className={cn(
          'space-y-3 md:space-y-4', // Reduced vertical spacing on mobile
          centered && 'flex flex-col items-center',
          actions
            ? 'md:flex md:flex-row md:items-center md:justify-between md:space-y-0'
            : undefined
        )}
      >
        <div className={cn('space-y-3 md:space-y-4', centered && 'flex flex-col items-center')}>
          <HeaderTitle centered={centered}>{displayTitle}</HeaderTitle>
          
          {description && (
            <HeaderDescription centered={centered}>{description}</HeaderDescription>
          )}
          
          {children && (
            <div className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl">
              {children}
            </div>
          )}
        </div>

        {actions && (
          <HeaderActions centered={centered}>
            {actions}
          </HeaderActions>
        )}
      </div>
    </div>
  );
} 