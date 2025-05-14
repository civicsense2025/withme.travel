import React from 'react';
import { useTheme } from 'next-themes';
import { useWhiteboardContext } from '../context/whiteboard-context';

interface GridOverlayProps {
  width: number;
  height: number;
}

export function GridOverlay({ width, height }: GridOverlayProps) {
  const { viewMode /*, showGrid, getGridCellSize */ } = useWhiteboardContext();
  const { theme } = useTheme();

  // if (!showGrid) return null; // Commented out as showGrid is not in context

  const gridCellSize = 30; // Assuming a default, original was getGridCellSize()
  // Use CSS variable for grid color that respects dark mode
  const gridColor = 'rgba(var(--grid-color), var(--grid-opacity))';

  // Calculate number of horizontal and vertical lines
  const horizontalLines = Math.ceil(height / gridCellSize);
  const verticalLines = Math.ceil(width / gridCellSize);

  return (
    <div
      className="absolute inset-0 pointer-events-none z-0 grid-overlay"
      style={
        {
          width: width,
          height: height,
          transformOrigin: '0 0',
          // transform: `scale(${viewMode.scale}) translate(${viewMode.translateX}px, ${viewMode.translateY}px)`, // Commented out as viewMode doesn't have these props
          // Set dark-mode aware grid color variables inline
          '--grid-color': theme === 'dark' ? '255, 255, 255' : '0, 0, 0',
          '--grid-opacity': theme === 'dark' ? '0.1' : '0.07',
        } as React.CSSProperties
      }
      aria-hidden="true"
    >
      <svg
        width={width}
        height={height}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ overflow: 'visible' }}
      >
        {/* Horizontal grid lines */}
        {Array.from({ length: horizontalLines + 1 }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={i * gridCellSize}
            x2={width}
            y2={i * gridCellSize}
            stroke={gridColor}
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {/* Vertical grid lines */}
        {Array.from({ length: verticalLines + 1 }).map((_, i) => (
          <line
            key={`v-${i}`}
            x1={i * gridCellSize}
            y1="0"
            x2={i * gridCellSize}
            y2={height}
            stroke={gridColor}
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    </div>
  );
}
