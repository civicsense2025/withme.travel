import React from 'react';
import { motion } from 'framer-motion';

interface CursorProps {
  position: { x: number; y: number };
  name: string;
  color: string;
  isActive?: boolean;
}

export function Cursor({ position, name, color, isActive = true }: CursorProps) {
  if (!position) return null;

  return (
    <motion.div
      className="absolute pointer-events-none z-50"
      initial={{ opacity: 0 }}
      animate={{
        opacity: isActive ? 1 : 0.5,
        x: position.x,
        y: position.y,
      }}
      transition={{ ease: 'linear', duration: 0.1 }}
    >
      {/* Cursor triangle */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: isActive ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' : 'none',
        }}
      >
        <path
          d="M8.5,3.5 L3.5,21.5 L14.5,16.5 L20.5,10.5 L8.5,3.5 Z"
          fill={color}
          stroke="#ffffff"
          strokeWidth="1.5"
        />
      </svg>

      {/* User name label */}
      <div
        className="absolute text-xs px-2 py-1 rounded-md whitespace-nowrap"
        style={{
          top: '0',
          left: '14px',
          backgroundColor: color,
          color: '#ffffff',
          fontWeight: 600,
          boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
          opacity: isActive ? 1 : 0.7,
        }}
      >
        {name}
      </div>
    </motion.div>
  );
}
