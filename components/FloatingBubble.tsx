import React from 'react';

interface FloatingBubbleProps {
  id: number;
  size: number;
  color: string;
  position: { top: string; left: string };
}

export const FloatingBubble: React.FC<FloatingBubbleProps> = ({ size, color, position }) => {
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