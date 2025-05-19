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
 * TripPresenceIndicator
 * Displays real-time presence and connection status for the trip.
 * Always returns a JSX.Element (never null/undefined) for type safety.
 */
/**
 * TripPresenceIndicator
 * Displays real-time presence and connection status for the trip.
 * Always returns a JSX.Element (never null/undefined) for type safety.
 *
 * Usage:
 *   <TripPresenceIndicator />
 */
const TripPresenceIndicator: React.FC = () => {
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
      setErrorMessage('Connecting...');
    } else if (connectionState === 'disconnected') {
      setIsReconnecting(false);
      setErrorMessage(presenceError?.message || 'Connection lost');
    }
  }, [connectionState, presenceError]);

  // --- Connection quality ---
  useEffect(() => {
    if (currentConnectionState === 'connected') {
      setConnectionQuality('good');
    } else if (currentConnectionState === 'connecting') {
      setConnectionQuality('fair');
    } else {
      setConnectionQuality('poor');
    }
  }, [currentConnectionState]);

  // --- Cleanup on unmount ---
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cleanupCursorElementsCallback();
    };
  }, [cleanupCursorElementsCallback]);

  // --- Type guard ---
  function isExtendedUserPresence(
    user: UserPresence | ExtendedUserPresence
  ): user is ExtendedUserPresence {
    return (
      typeof user === 'object' &&
      user !== null &&
      ('cursor_position' in user || 'editing_item_id' in user || 'page_path' in user)
    );
  }

  // --- Render user cursor portals ---
  const renderCursor = useCallback((extUser: ExtendedUserPresence): React.ReactPortal | null => {
    try {
      if (
        !extUser ||
        !extUser.cursor_position ||
        typeof extUser.cursor_position.x !== 'number' ||
        typeof extUser.cursor_position.y !== 'number'
      ) {
        return null;
      }
      const { x, y } = extUser.cursor_position;
      const userColor = generateUserColor(extUser.user_id);
      // Defensive: Only allow known status values
      let statusClassName = 'text-gray-400';
      if (extUser.status === 'active') statusClassName = 'text-green-500';
      else if (extUser.status === 'idle') statusClassName = 'text-yellow-500';
      const tooltipClassName =
        'absolute left-1/2 top-8 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-1 text-xs shadow bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 z-50';

      return createPortal(
        <div
          key={String(extUser.user_id)}
          className="user-cursor absolute pointer-events-none z-[100] transition-transform duration-100 ease-linear group"
          data-presence-tooltip={`user-${String(extUser.user_id)}`}
          data-presence-portal="true"
          style={{
            transform: `translate(${Number(x)}px, ${Number(y)}px)`,
          }}
        >
          <div className="relative" style={{ transform: 'translate(-50%, -50%)' }}>
            <MousePointerClick
              className={`h-4 w-4 ${statusClassName}`}
              style={{ color: userColor as React.CSSProperties['color'] }}
            />
            <div
              className={tooltipClassName}
              style={{
                backgroundColor: `${userColor}30`,
                color: userColor as React.CSSProperties['color'],
                border: `1px solid ${userColor}40`,
              }}
            >
              <div className="flex items-center gap-1">
                <span className="font-medium">
                  {typeof extUser?.name === 'string' && extUser.name
                    ? extUser.name
                    : typeof extUser?.email === 'string' && extUser.email
                      ? extUser.email
                      : 'User'}
                </span>
                {typeof extUser?.editing_item_id === 'string' && extUser.editing_item_id && (
                  <span className="ml-1 flex items-center text-[10px]">
                    <Edit className="h-2.5 w-2.5 mr-0.5" /> Editing
                  </span>
                )}
              </div>
              {extUser?.last_active &&
                (typeof extUser.last_active === 'string' ? (
                  <span className="text-[10px] opacity-80">
                    Active {formatTimeAgo(extUser.last_active)}
                  </span>
                ) : null)}
            </div>
          </div>
        </div>,
        document.body
      );
    } catch (error) {
      // Defensive: extUser.user_id may not be string/number
      const userId =
        typeof extUser?.user_id === 'string' || typeof extUser?.user_id === 'number'
          ? extUser.user_id
          : '[unknown]';
      console.warn(`Error rendering cursor for user ${userId}:`, error);
      return null;
    }
  }, []);

  // --- Memoized rendering of all cursors ---
  const renderedCursors = useMemo(() => {
    if (!showCursors) return null;
    const extendedUsers: ExtendedUserPresence[] = Array.isArray(activeUsers)
      ? (activeUsers as unknown[]).reduce<ExtendedUserPresence[]>((acc, user) => {
          if (
            isExtendedUserPresence(user as UserPresence) &&
            user &&
            typeof user === 'object' &&
            'cursor_position' in user &&
            user.cursor_position &&
            typeof (user.cursor_position as CursorPosition).x === 'number' &&
            typeof (user.cursor_position as CursorPosition).y === 'number' &&
            'status' in user &&
            user.status !== 'offline' &&
            user.status !== 'away'
          ) {
            acc.push(user as ExtendedUserPresence);
          }
          return acc;
        }, [])
      : [];
    const portals: React.ReactPortal[] = extendedUsers
      .map((user) => renderCursor(user))
      .filter((el): el is React.ReactPortal => el !== null);
    return portals;
  }, [activeUsers, showCursors, renderCursor]);

  // --- Connection Quality Indicator ---
  const getConnectionQualityIndicator = () => {
    const indicators: Record<'good' | 'fair' | 'poor', { color: string; message: string }> = {
      good: { color: 'bg-green-500', message: 'Connection stable' },
      fair: { color: 'bg-yellow-500', message: 'Connection may have delays' },
      poor: { color: 'bg-red-500', message: 'Connection unstable or disconnected' },
    };
    const { color, message } = indicators[connectionQuality];
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`w-2 h-2 rounded-full ${color} mr-1 cursor-help`} />
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{message}</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  // --- Main render ---
  return (
    <TooltipProvider>
      <div className="bg-background/75 backdrop-blur-sm p-2 rounded-lg shadow-sm border border-border/10">
        {/* Connection Error Alert */}
        {currentConnectionState !== 'connected' && errorMessage && (
          <Alert variant="destructive" className="mb-2 py-1 px-2 text-xs">
            <AlertCircle className="h-3 w-3 mr-1" />
            <AlertDescription className="flex items-center justify-between w-full">
              <span className="truncate max-w-[150px]">{errorMessage}</span>
              {currentConnectionState === 'disconnected' && (
                <Button
                  variant="link"
                  size="sm"
                  className="ml-2 px-1 py-0 h-5 text-xs"
                  onClick={async () => {
                    setIsReconnecting(true);
                    setErrorMessage('Reconnecting...');
                    try {
                      await recoverPresence();
                    } catch (err) {
                      setErrorMessage('Failed to reconnect');
                    } finally {
                      setIsReconnecting(false);
                    }
                  }}
                  disabled={isReconnecting}
                >
                  {isReconnecting ? 'Reconnecting...' : 'Retry'}
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Presence summary */}
        <div className="flex items-center gap-2">
          {getConnectionQualityIndicator()}
          <span className="text-xs text-muted-foreground">
            {activeUsers.length > 0
              ? `${activeUsers.length} ${activeUsers.length === 1 ? 'person' : 'people'} online`
              : 'No one else online'}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            aria-label={showCursors ? 'Hide cursors' : 'Show cursors'}
            onClick={() => setShowCursors((prev) => !prev)}
          >
            {showCursors ? (
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            ) : (
              <MousePointerClick className="h-4 w-4 text-muted-foreground opacity-30" />
            )}
          </Button>
        </div>

        {/* Render user cursors as portals */}
        {showCursors && renderedCursors}
      </div>
    </TooltipProvider>
  );
};
export { TripPresenceIndicator };
