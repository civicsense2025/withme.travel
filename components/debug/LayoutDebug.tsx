'use client';

import React, { useState } from 'react';
import { Grid, LayoutGrid, X } from 'lucide-react';

interface LayoutDebugProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

/**
 * LayoutDebug - A component to help debug layout issues
 * Wraps content with a toggleable outline and grid overlay
 */
export function LayoutDebug({ children, title, className = '' }: LayoutDebugProps) {
  const [showOutline, setShowOutline] = useState(false);
  const [showGrid, setShowGrid] = useState(false);

  const outlineClass = showOutline ? 'debug-outline' : '';

  return (
    <div className={`relative ${outlineClass} ${className}`}>
      {/* Debug Controls */}
      <div className="absolute top-0 right-0 flex space-x-1 bg-white/90 border border-gray-200 rounded shadow-sm p-1 z-50">
        <button
          onClick={() => setShowOutline(!showOutline)}
          className={`p-1 rounded-sm hover:bg-gray-100 ${showOutline ? 'bg-blue-100' : ''}`}
          title="Toggle outline"
        >
          <LayoutGrid className="h-3 w-3" />
        </button>
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`p-1 rounded-sm hover:bg-gray-100 ${showGrid ? 'bg-blue-100' : ''}`}
          title="Toggle grid"
        >
          <Grid className="h-3 w-3" />
        </button>
      </div>

      {/* Optional Title */}
      {title && showOutline && (
        <div className="absolute top-0 left-0 bg-red-100 text-red-800 text-xs font-mono px-1 z-50">
          {title}
        </div>
      )}

      {/* Content */}
      {children}

      {/* Grid Overlay */}
      {showGrid && (
        <div className="absolute inset-0 grid grid-cols-12 gap-4 pointer-events-none z-40">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-full bg-blue-400 bg-opacity-10 border-x border-blue-400 border-opacity-20"
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * A simple debug boundary to visually mark components
 */
export function DebugBoundary({
  children,
  label,
  color = 'red',
}: {
  children: React.ReactNode;
  label?: string;
  color?: 'red' | 'blue' | 'green' | 'purple' | 'yellow';
}) {
  const [visible, setVisible] = useState(true);

  const colorClasses = {
    red: 'border-red-400 bg-red-50 text-red-800',
    blue: 'border-blue-400 bg-blue-50 text-blue-800',
    green: 'border-green-400 bg-green-50 text-green-800',
    purple: 'border-purple-400 bg-purple-50 text-purple-800',
    yellow: 'border-yellow-400 bg-yellow-50 text-yellow-800',
  };

  if (!visible) return <>{children}</>;

  return (
    <div className={`border-2 border-dashed p-4 relative ${colorClasses[color]}`}>
      {label && (
        <div className="absolute -top-2 left-2 px-1 text-xs font-mono bg-white">{label}</div>
      )}
      <button
        onClick={() => setVisible(false)}
        className="absolute top-1 right-1 p-1 rounded-full hover:bg-gray-200/50"
        title="Remove debug boundary"
      >
        <X className="h-3 w-3" />
      </button>
      {children}
    </div>
  );
}
