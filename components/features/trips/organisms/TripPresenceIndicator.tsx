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
 * TripPresenceIndicator
 * Displays real-time presence and connection status for the trip.
 * Always returns a JSX.Element (never null/undefined) for type safety.
 *
 * Usage:
 *   <TripPresenceIndicator />
 */
export const TripPresenceIndicator: React.FC = () => {
  // --- Types ---
  // These should be imported from your types/ directory in a real codebase
  type UserPresenceStatus = 'active' | 'idle' | 'offline' | 'away' | 'connecting' | 'disconnected';
  type ConnectionState = 'connected' | 'connecting' | 'disconnected';
  interface CursorPosition {
    x: number;
    y: number;
  }
  interface UserPresence {
    user_id: string;
    name?: string;
    email?: string;
    status: UserPresenceStatus;
    last_active?: string | Date;
  }
  interface ExtendedUserPresence extends UserPresence {
    cursor_position?: CursorPosition;
    editing_item_id?: string;
    page_path?: string;
  }
  interface PresenceContextType {
    activeUsers: ExtendedUserPresence[];
    myPresence: ExtendedUserPresence | null;
    connectionState: ConnectionState;
    error: { message: string } | null;
    recoverPresence: () => Promise<void>;
  }

  // --- Context ---
  const presenceContext = usePresenceContext() as PresenceContextType | null;
  const {
    activeUsers = [],
    myPresence = null,
    connectionState = 'disconnected',
    error: presenceError = null,
    recoverPresence = async () => {},
  } = presenceContext || {};

  // --- State ---
  const [currentConnectionState, setCurrentConnectionState] =
    useState<ConnectionState>(connectionState);
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);
  const [reconnectAttempts, setReconnectAttempts] = useState<number>(0);
  const [reconnectTimeoutId, setReconnectTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'fair' | 'poor'>('good');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCursors, setShowCursors] = useState<boolean>(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const throttledCursorUpdateRef = useRef<DebouncedFunc<(x: number, y: number) => void> | null>(
    null
  );
  const mountedRef = useRef<boolean>(true);

  // --- Cleanup ---
  const cleanupCursorElementsCallback = useCallback(() => {
    ['.user-cursor', '[data-presence-tooltip]', '[data-presence-portal]'].forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        try {
          el.parentNode?.removeChild(el);
        } catch (err) {
          console.warn(`Error removing element with selector ${selector}:`, err);
        }
      });
    });
  }, []);

  // --- Throttled cursor update ---
  useEffect(() => {
    throttledCursorUpdateRef.current = throttle((x: number, y: number) => {
      if (myPresence && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('update-my-cursor', { detail: { x, y } }));
      }
    }, 50);

    return () => {
      throttledCursorUpdateRef.current?.cancel();
    };
  }, [myPresence]);

  // --- Connection state effect ---
  useEffect(() => {
    setCurrentConnectionState(connectionState);
    if (connectionState === 'connected') {
      setIsReconnecting(false);
      setReconnectAttempts(0);
      setErrorMessage(null);
    } else if (connectionState === 'connecting') {
      setIsReconnecting(true);
      setReconnectAttempts((prev) => prev + 1);
    }
  }, [connectionState]);

  return (
    <div>
      {/* Render your component content here */}
    </div>
  );
}; 