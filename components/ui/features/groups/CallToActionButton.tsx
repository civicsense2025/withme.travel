/**
 * CallToActionButton Component
 *
 * An animated button component styled for primary actions in group-related sections.
 * Features motion animations for interactive feedback.
 */

// ============================================================================
// IMPORTS
// ============================================================================

import React from 'react';
import { motion } from 'framer-motion';
import { LayoutType } from '@/utils/constants/groupCirclesConstants';

// ============================================================================
// TYPES
// ============================================================================

/** Props for the CallToActionButton component */
export interface CallToActionButtonProps {
  /** Current layout based on screen size */
  layout: LayoutType;
  /** Click handler for the button */
  onClick: () => void;
  /** Text to display on the button */
  buttonText: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * CallToActionButton - An animated primary action button
 * 
 * @example
 * <CallToActionButton
 *   layout="desktop"
 *   onClick={handleStartPlanning}
 *   buttonText="Start planning together"
 * />
 */
export function CallToActionButton({ layout, onClick, buttonText }: CallToActionButtonProps) {
  const primaryButtonColor = '#7c83fd'; // Theme this
  const primaryButtonTextColor = 'white'; // Theme this

  const buttonStyle: React.CSSProperties = {
    backgroundColor: primaryButtonColor,
    color: primaryButtonTextColor,
    border: 'none',
    padding: layout === 'mobile' ? '0.75rem 1.5rem' : '1rem 2rem',
    borderRadius: '3rem',
    fontWeight: 600,
    fontSize: layout === 'mobile' ? '1rem' : '1.125rem',
    cursor: 'pointer',
    boxShadow: `0 4px 12px rgba(124,131,253,0.13)`, // Use themed color
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05, boxShadow: `0 10px 20px rgba(124,131,253,0.18)` }}
      whileTap={{ scale: 0.98 }}
      style={buttonStyle}
      onClick={onClick}
    >
      {buttonText}
    </motion.button>
  );
}; 