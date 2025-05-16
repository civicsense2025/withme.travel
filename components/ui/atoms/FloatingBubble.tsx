/**
 * FloatingBubble Component
 * 
 * A decorative circle element for creating visual interest in backgrounds.
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
  /** Size of the bubble in pixels */
  size: number;
  /** Background color of the bubble */
  color: string;
  /** Position coordinates for the bubble */
  position: { 
    /** Top position (CSS value) */
    top: string; 
    /** Left position (CSS value) */
    left: string 
  };
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * FloatingBubble - A decorative circle element for backgrounds
 * 
 * @example
 * <FloatingBubble 
 *   id={1}
 *   size={60}
 *   color="rgba(59, 130, 246, 0.2)"
 *   position={{ top: "20%", left: "80%" }}
 * />
 */
export function FloatingBubble({ 
  size, 
  color, 
  position 
}: FloatingBubbleProps) {
  const style: React.CSSProperties = {
    position: 'absolute',
    width: size,
    height: size,
    borderRadius: '50%',
    backgroundColor: color,
    top: position.top,
    left: position.left,
    zIndex: 0, // Behind content
    opacity: 0.6,
    filter: 'blur(8px)',
    transition: 'transform 3s ease-in-out',
    animation: 'float 15s infinite ease-in-out',
  };
  
  return <div style={style} aria-hidden="true" />;
}

export default FloatingBubble; 