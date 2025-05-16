/**
 * SectionHeader Component
 *
 * Displays a stylized section header with title and subtitle.
 * Adapts to different layouts and themes for consistent presentation.
 */

// ============================================================================
// IMPORTS
// ============================================================================

import React from 'react';
import { LayoutType } from '@/utils/constants/groupCirclesConstants';

// ============================================================================
// TYPES
// ============================================================================

/** Props for the SectionHeader component */
export interface SectionHeaderProps {
  /** Main title, supports ReactNode for embedded styling/elements */
  title: React.ReactNode;
  /** Supporting text description */
  subtitle: string;
  /** Current layout based on screen size */
  layout: LayoutType;
  /** Text color for the main title */
  textColor: string;
  /** Muted color for the subtitle */
  mutedColor: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * SectionHeader - A consistent header with title and subtitle for page sections
 * 
 * @example
 * <SectionHeader
 *   title="Explore Together"
 *   subtitle="Discover new destinations with friends and family"
 *   layout="desktop"
 *   textColor="#000000"
 *   mutedColor="#666666"
 * />
 */
export function SectionHeader({ title, subtitle, layout, textColor, mutedColor }: SectionHeaderProps) {
  const headerStyles: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: layout === 'mobile' ? '1.5rem' : '3rem',
    position: 'relative',
    zIndex: 1,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: layout === 'mobile' ? '1.5rem' : '2.5rem',
    fontWeight: 700,
    marginBottom: '0.5rem',
    color: textColor,
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: layout === 'mobile' ? '1rem' : '1.25rem',
    color: mutedColor,
    maxWidth: 600,
    margin: '0 auto',
  };

  return (
    <div style={headerStyles}>
      <h2 style={titleStyles}>{title}</h2>
      <p style={subtitleStyles}>{subtitle}</p>
    </div>
  );
}; 