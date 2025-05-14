import React, { useEffect, useState } from 'react';
import { Cursor } from './cursor';
import { useWhiteboardContext } from '../context/whiteboard-context';

interface CursorData {
  id: string;
  name: string;
  position: { x: number; y: number };
  lastActive: number;
  color: string;
}

interface CursorLayerProps {
  cursors: CursorData[];
  ownCursor: { x: number; y: number } | null;
  ownId: string;
}

// Generate a pastel color based on a string (user ID)
function generatePastelColor(str: string): string {
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convert to pastel color
  const h = hash % 360;
  return `hsl(${h}, 70%, 80%)`;
}

export function CursorLayer({ cursors, ownCursor, ownId }: CursorLayerProps) {
  const { viewMode } = useWhiteboardContext();
  const [inactiveThreshold] = useState(5000); // 5 seconds

  // Adjust cursors for the current view
  const adjustCursorPosition = (position: { x: number; y: number }) => {
    if (!position) return position;

    // No need to adjust as cursors are in screen coordinates
    return position;
  };

  // Current timestamp
  const now = Date.now();

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Render other users' cursors */}
      {cursors
        .filter((cursor) => cursor.id !== ownId)
        .map((cursor) => {
          const adjustedPosition = adjustCursorPosition(cursor.position);
          const isActive = now - cursor.lastActive < inactiveThreshold;

          return (
            <Cursor
              key={cursor.id}
              position={adjustedPosition}
              name={cursor.name}
              color={cursor.color || generatePastelColor(cursor.id)}
              isActive={isActive}
            />
          );
        })}

      {/* Render own cursor */}
      {ownCursor && (
        <Cursor
          position={ownCursor}
          name="You"
          color="#6366f1" // Indigo color for own cursor
          isActive={true}
        />
      )}
    </div>
  );
}
