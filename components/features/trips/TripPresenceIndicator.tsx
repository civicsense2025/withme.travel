/**
 * @deprecated This component has been moved to components/features/trips/organisms/TripPresenceIndicator.tsx
 * Please update your imports to use the new location.
 */
'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import throttle from 'lodash/throttle';
import type { DebouncedFunc } from 'lodash'; // Import DebouncedFunc type
// TODO: Fix import path if/when presence-context is available. For now, use a type-safe fallback.
const usePresenceContext = () => {
  throw new Error(
    'usePresenceContext is not implemented. Please provide a valid implementation or mock.'
  );
};
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Edit,
  Activity,
  Coffee,
  UserRound,
  Wifi,
  WifiOff,
  Clock,
  MousePointer,
  MousePointerClick,
  Info,
  RotateCw,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import libUtils from '@/utils/lib-utils';
import {
  ConnectionState,
  ExtendedUserPresence,
  ImportedUserPresence,
  UserPresence,
  UserPresenceStatus,
} from '@/types/presence';
import { cn } from '@/lib/utils';

const { getInitials } = libUtils;

// Helper to format time ago
const formatTimeAgo = (dateString: string | undefined): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);

  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
};

// Helper to get status icon
const getStatusIcon = (status: UserPresenceStatus | undefined) => {
  switch (status) {
    case 'editing':
      return <Edit className="h-3 w-3 text-blue-500" />;
    case 'online':
      return <Activity className="h-3 w-3 text-green-500" />;
    case 'away':
      return <Coffee className="h-3 w-3 text-yellow-500" />;
    case 'offline':
    default:
      return <UserRound className="h-3 w-3 text-gray-500" />;
  }
};

// Helper to get status badge
const getStatusBadge = (status: UserPresenceStatus | undefined) => {
  const statusStyles: Record<string, string> = {
    editing: 'bg-blue-500 hover:bg-blue-600',
    online: 'bg-green-500 hover:bg-green-600',
    away: 'bg-yellow-500 hover:bg-yellow-600',
    offline: 'bg-gray-500 hover:bg-gray-600',
    error: 'bg-red-500 hover: bg-red-600',
  };
  const currentStatus = status || 'offline';

  return (
    <Badge
      variant="secondary"
      className={`${statusStyles[currentStatus]} text-white text-xs flex items-center gap-1`}
    >
      {getStatusIcon(currentStatus)}
      <span className="capitalize">{currentStatus}</span>
    </Badge>
  );
};

// Helper to get activity info string
const getActivityInfo = (user: ImportedUserPresence | ExtendedUserPresence | null): string => {
  if (!user) return 'Unknown activity';

  if (user.status === 'editing' && (user as ExtendedUserPresence).editing_item_id) {
    return 'Editing an item';
  }

  const extendedUser = user as ExtendedUserPresence; // Assume ExtendedUserPresence properties might exist
  if (extendedUser?.page_path) {
    const path = extendedUser.page_path;
    if (path?.includes('/itinerary/')) return 'Viewing item details';
    if (path?.includes('/edit')) return 'Editing trip details';
    if (path?.includes('/manage')) return 'Managing trip settings';
  }

  if (extendedUser?.last_active) {
    return `Active ${formatTimeAgo(extendedUser.last_active)}`;
  }

  return 'Browsing the trip';
};

// Helper to generate deterministic color based on user ID
const generateUserColor = (userId: string): string => {
  const hash = userId.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 70%, 50%)`;
};

// Comprehensive cleanup function for cursor elements
const cleanupCursorElements = () => {
  ['.user-cursor', '[data-presence-tooltip]', '[data-presence-portal]'].forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      try {
        el.parentNode?.removeChild(el);
      } catch (err) {
        console.warn(`Error removing element with selector ${selector}:`, err);
      }
    });
  });
};

// Type guard to check if a UserPresence is an ExtendedUserPresence
function isExtendedUserPresence(user: UserPresence): user is ExtendedUserPresence {
  return 'cursor_position' in user || 'editing_item_id' in user || 'page_path' in user;
}

/**
 * TripPresenceIndicator Component
 *
 * Shows presence/online status of users in a trip.
 * @module components/features/trips/TripPresenceIndicator
 */

/**
 * TripPresenceIndicator component props
 */
export interface TripPresenceIndicatorProps {
  /** List of present users */
  users: { id: string; name: string; avatarUrl?: string }[];
  /** Additional className for styling */
  className?: string;
}

/**
 * TripPresenceIndicator for trip presence (placeholder)
 */
export function TripPresenceIndicator({ users, className }: TripPresenceIndicatorProps) {
  // TODO: Implement presence indicator UI
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span>Present:</span>
      {users.map((u) => (
        <span key={u.id} title={u.name} style={{ display: 'inline-block', marginRight: 4 }}>
          {u.avatarUrl ? (
            <img src={u.avatarUrl} alt={u.name} style={{ width: 24, height: 24, borderRadius: '50%' }} />
          ) : (
            <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#eee', display: 'inline-block', textAlign: 'center', lineHeight: '24px' }}>{u.name[0]}</span>
          )}
        </span>
      ))}
    </div>
  );
}

export default TripPresenceIndicator;
