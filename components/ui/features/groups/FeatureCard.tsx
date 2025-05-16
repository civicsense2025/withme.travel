/**
 * FeatureCard Component
 *
 * Displays a feature highlight with an emoji, title, and description.
 * Used in feature callout sections to showcase product capabilities.
 */

// ============================================================================
// IMPORTS
// ============================================================================

import React from 'react';
import { ThemeMode, getColorToken } from '@/utils/constants/design-system';

// ============================================================================
// TYPES
// ============================================================================

/** Props for the FeatureCard component */
export interface FeatureCardProps {
  /** Emoji to visually represent the feature */
  emoji: string;
  /** Feature title/headline */
  title: string;
  /** Feature description text */
  description: string;
  /** Current theme mode for color styling */
  currentTheme: ThemeMode;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * FeatureCard - Displays an individual product feature with visual elements
 * 
 * @example
 * <FeatureCard
 *   emoji="✨"
 *   title="Real-time Collaboration"
 *   description="Plan together with friends in real-time"
 *   currentTheme="light"
 * />
 */
export function FeatureCard({ emoji, title, description, currentTheme }: FeatureCardProps) {
  const textColor = getColorToken('TEXT', currentTheme);
  const mutedColor = getColorToken('MUTED', currentTheme);

  const cardStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '1.5rem', // Can be themed
  };
  
  const emojiStyle: React.CSSProperties = {
    fontSize: '2.2rem',
    margin: '0 auto 1rem auto',
  };
  
  const titleStyle: React.CSSProperties = {
    fontWeight: 700,
    marginBottom: '0.5rem',
    color: textColor,
  };
  
  const descriptionStyle: React.CSSProperties = {
    color: mutedColor,
  };

  return (
    <div style={cardStyle}>
      <div style={emojiStyle}>{emoji}</div>
      <h3 style={titleStyle}>{title}</h3>
      <p style={descriptionStyle}>{description}</p>
    </div>
  );
}; 