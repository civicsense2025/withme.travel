'use client';

import React from 'react';
import { MousePointerClick, Edit } from 'lucide-react';
import { UserPresence } from '@/types/presence';

interface CursorProps {
  user: UserPresence;
  position: { x: number; y: number };
}

export function Cursor({ user, position }: CursorProps) {
  // Generate a deterministic color based on the user's ID
  const generateUserColor = (userId: string) => {
    // Simple hash function
    const hash = userId.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 70%, 50%)`;
  };
  
  const userColor = generateUserColor(user.user_id);
  const statusClassName = user.status === 'editing' ? 'animate-pulse' : '';
  
  // Format time ago from ISO string
  const formatTimeAgo = (isoString: string): string => {
    const now = new Date();
    const then = new Date(isoString);
    const diffMs = now.getTime() - then.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  };
  
  return (
    <div 
      className="absolute pointer-events-none z-50 transition-all duration-300 ease-out user-cursor group"
      data-presence-tooltip={`user-${user.user_id}`}
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div className="relative">
        <MousePointerClick 
          className={`h-4 w-4 ${statusClassName}`} 
          style={{ color: userColor }} 
        />
        <div 
          className="absolute left-5 top-0 px-2 py-1 rounded-md text-xs font-medium 
            whitespace-nowrap opacity-0 group-hover:opacity-100
            transition-opacity duration-200 z-50 pointer-events-none"
          style={{ 
            backgroundColor: `${userColor}30`, 
            color: userColor, 
            border: `1px solid ${userColor}40` 
          }}
        >
          <div className="flex items-center gap-1">
            <span className="font-medium">{user.name || 'Unknown user'}</span>
            {user.editing_item_id && (
              <span className="ml-1 flex items-center text-[10px]">
                <Edit className="h-2.5 w-2.5 mr-0.5" /> Editing
              </span>
            )}
          </div>
          {user.last_seen && (
            <span className="text-[10px] opacity-80">
              Active {formatTimeAgo(user.last_seen)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
} 