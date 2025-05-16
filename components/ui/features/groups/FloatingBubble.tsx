/**
 * FloatingBubble Component
 *
 * A decorative bubble element for visual enhancement of group-related UI sections.
 * Creates a soft, playful atmosphere by rendering semi-transparent floating bubbles.
 */

// ============================================================================
// IMPORTS
// ============================================================================

import React from 'react';

// ============================================================================
// TYPES
// ============================================================================

/** Props for the FloatingBubble component */
export interface FloatingBubbleProps {
  /** Unique identifier for the bubble */
  id: number;
  /** Size in pixels (rendered as both width and height) */
  size: number;
  /** CSS color string for the bubble */
  color: string;
  /** Position on the screen defined by top and left percentages */
  position: { top: string; left: string };
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * FloatingBubble - A decorative floating circle element
 * 
 * @example
 * <FloatingBubble
 *   id={1}
 *   size={60}
 *   color="rgba(124, 131, 253, 0.1)"
 *   position={{ top: "20%", left: "40%" }}
 * />
 */
export function FloatingBubble({ size, color, position }: FloatingBubbleProps) {
  const style: React.CSSProperties = {
    position: 'absolute',
    width: size,
    height: size,
    borderRadius: '50%',
    backgroundColor: color,
    top: position.top,
    left: position.left,
    zIndex: 0, // Behind content
  };
  
  return <div style={style} aria-hidden="true" />;
}; 