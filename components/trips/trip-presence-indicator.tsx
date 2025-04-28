"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import throttle from 'lodash/throttle';
import type { DebouncedFunc } from 'lodash'; // Import DebouncedFunc type
import { usePresenceContext } from '@/components/presence/presence-context';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Edit, Activity, Coffee, UserRound, Wifi, WifiOff, Clock,
  MousePointer, MousePointerClick, Info, RotateCw, Loader2, AlertCircle
} from 'lucide-react';
import { getInitials } from "@/lib/utils"; // Assuming getInitials is in lib/utils
import { ConnectionState, ExtendedUserPresence, ImportedUserPresence } from '@/types/presence'; // Import presence types

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
const getStatusIcon = (status: string | undefined) => {
  switch(status) {
    case 'editing': return <Edit className="h-3 w-3 text-blue-500" />;
    case 'online': return <Activity className="h-3 w-3 text-green-500" />;
    case 'away': return <Coffee className="h-3 w-3 text-yellow-500" />;
    case 'offline':
    default: return <UserRound className="h-3 w-3 text-gray-500" />;
  }
};

// Helper to get status badge
const getStatusBadge = (status: string | undefined) => {
  const statusStyles: Record<string, string> = {
    editing: "bg-blue-500 hover:bg-blue-600",
    online: "bg-green-500 hover:bg-green-600",
    away: "bg-yellow-500 hover:bg-yellow-600",
    offline: "bg-gray-500 hover:bg-gray-600",
    error: "bg-red-500 hover:bg-red-600",
  };
  const currentStatus = status || 'offline';

  return (
    <Badge variant="secondary" className={`${statusStyles[currentStatus]} text-white text-xs flex items-center gap-1`}>
      {getStatusIcon(currentStatus)}
      <span className="capitalize">{currentStatus}</span>
    </Badge>
  );
};

// Helper to get activity info string
const getActivityInfo = (user: ImportedUserPresence | ExtendedUserPresence | null): string => {
    if (!user) return 'Unknown activity';

    if (user.status === 'editing' && user.editing_item_id) {
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
  ['.user-cursor', '[data-presence-tooltip]', '[data-presence-portal]'].forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      try {
        el.parentNode?.removeChild(el);
      } catch (err) {
        console.warn(`Error removing element with selector ${selector}:`, err);
      }
    });
  });
};


export function TripPresenceIndicator(): React.ReactNode {
  const {
    activeUsers,
    myPresence,
    connectionState,
    error: presenceError,
    recoverPresence
  } = usePresenceContext();

  const [currentConnectionState, setCurrentConnectionState] = useState<ConnectionState>(connectionState);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [reconnectTimeoutId, setReconnectTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'fair' | 'poor'>('good');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCursors, setShowCursors] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
  const throttledCursorUpdateRef = useRef<DebouncedFunc<(x: number, y: number) => void> | null>(null);

  // Initialize throttled function
  useEffect(() => {
    throttledCursorUpdateRef.current = throttle((x: number, y: number) => {
      if (myPresence && typeof window !== 'undefined') {
         window.dispatchEvent(new CustomEvent('update-my-cursor', { detail: { x, y } }));
      }
    }, 50); // Throttle interval

    return () => {
      throttledCursorUpdateRef.current?.cancel();
    };
  }, [myPresence]);

  // Update local connection state and quality based on context
  useEffect(() => {
      setCurrentConnectionState(connectionState);

      if (connectionState === 'connected' && reconnectAttempts === 0) setConnectionQuality('good');
      else if (connectionState === 'connected') setConnectionQuality('fair');
      else if (connectionState === 'connecting') setConnectionQuality('fair');
      else setConnectionQuality('poor');

      if (presenceError) setErrorMessage(`Connection error: ${presenceError.message || 'Unknown error'}`);
      else if (connectionState === 'connecting') setErrorMessage('Connecting...');
      else if (connectionState === 'disconnected') setErrorMessage('Connection lost.');
      else setErrorMessage(null);

  }, [connectionState, presenceError, reconnectAttempts]);

  // Update last update time when activeUsers changes
  useEffect(() => {
    setLastUpdateTime(new Date());
  }, [activeUsers]);

  // Handle mouse movement for cursor tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      throttledCursorUpdateRef.current?.(e.clientX, e.clientY);
    };

    if (showCursors) {
      window.addEventListener('mousemove', handleMouseMove);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      throttledCursorUpdateRef.current?.cancel();
    };
  }, [showCursors]);

  // Cleanup cursor elements on unmount or when hiding
  useEffect(() => {
    if (!showCursors) {
      cleanupCursorElements();
    }
    // Ensure cleanup runs on unmount regardless of showCursors state
    return cleanupCursorElements;
  }, [showCursors]);


  // Reconnection Logic
  const handleReconnect = async () => {
      if (isReconnecting || connectionState === 'connected') return;

      if (reconnectTimeoutId) clearTimeout(reconnectTimeoutId);
      setIsReconnecting(true);

      try {
          setReconnectAttempts(prev => prev + 1);
          setErrorMessage('Attempting to reconnect...');

          // Timeout logic
          const timeoutPromise = new Promise((_, reject) => {
              const timeoutId = setTimeout(() => reject(new Error('Reconnection attempt timed out')), 10000);
              setReconnectTimeoutId(timeoutId);
          });

          await Promise.race([recoverPresence(), timeoutPromise]);

          // Success
          if (mountedRef.current) { // Check if still mounted
              setReconnectAttempts(0);
              setErrorMessage(null);
          }

      } catch (err: any) {
          console.error("Failed to reconnect:", err);
          if (mountedRef.current) { // Check if still mounted
              if (reconnectAttempts < 5) {
                  const backoffDelay = Math.min(30000, 1000 * Math.pow(2, reconnectAttempts));
                  setErrorMessage(`Reconnection failed. Retrying in ${Math.ceil(backoffDelay/1000)}s...`);
                  const timeoutId = setTimeout(handleReconnect, backoffDelay);
                  setReconnectTimeoutId(timeoutId);
              } else {
                  setErrorMessage('Multiple reconnection attempts failed. Please try again manually.');
              }
          }
      } finally {
           if (mountedRef.current) { // Check if still mounted
              setIsReconnecting(false);
              if (reconnectTimeoutId) {
                  clearTimeout(reconnectTimeoutId);
                  setReconnectTimeoutId(null);
              }
           }
      }
  };

  // Ref to track mount status for async operations
  const mountedRef = useRef(true);
  useEffect(() => {
      mountedRef.current = true;
      return () => {
          mountedRef.current = false;
          // Clear any pending reconnect timeouts on unmount
          if (reconnectTimeoutId) {
              clearTimeout(reconnectTimeoutId);
          }
      };
  }, [reconnectTimeoutId]); // Add reconnectTimeoutId dependency


  // Group users by status
  const usersByStatus = useMemo(() => ({
    editing: activeUsers.filter(user => user.status === 'editing'),
    online: activeUsers.filter(user => user.status === 'online'),
    away: activeUsers.filter(user => user.status === 'away'),
  }), [activeUsers]);

  // Toggle cursor visibility
  const toggleCursorVisibility = () => {
    setShowCursors(prev => !prev);
  };

  // Render individual cursor position
  const renderCursor = (user: ExtendedUserPresence) => {
    try {
      const { x, y } = user.cursor_position || { x: -9999, y: -9999 }; // Position off-screen if null
      const userColor = generateUserColor(user.user_id);
      const statusClassName = user.status === 'editing' ? 'animate-pulse' : '';
      const tooltipClassName = `absolute left-5 top-0 px-2 py-1 rounded-md text-xs font-medium
        whitespace-nowrap opacity-0 group-hover:opacity-100 hover:opacity-100
        transition-opacity duration-200 z-50 pointer-events-none`;

      return createPortal(
        <div
          key={user.user_id}
          className="user-cursor absolute pointer-events-none z-[100] transition-transform duration-100 ease-linear group" // Increased z-index
          data-presence-tooltip={`user-${user.user_id}`}
          data-presence-portal="true"
          style={{
            transform: `translate(${x}px, ${y}px)` // Use translate for positioning
          }}
        >
          <div className="relative" style={{ transform: 'translate(-50%, -50%)' }}> {/* Center the icon */}
            <MousePointerClick className={`h-4 w-4 ${statusClassName}`} style={{ color: userColor }} />
            <div
              className={tooltipClassName}
              style={{ backgroundColor: `${userColor}30`, color: userColor, border: `1px solid ${userColor}40` }}
            >
              <div className="flex items-center gap-1">
                <span className="font-medium">{user?.name || user?.email || "User"}</span>
                {user?.editing_item_id && (
                  <span className="ml-1 flex items-center text-[10px]">
                    <Edit className="h-2.5 w-2.5 mr-0.5" /> Editing
                  </span>
                )}
              </div>
              {user?.last_active && (
                <span className="text-[10px] opacity-80">
                  Active {formatTimeAgo(user.last_active)}
                </span>
              )}
            </div>
          </div>
        </div>,
        document.body
      );
    } catch (error) {
      console.warn(`Error rendering cursor for user ${user.user_id}:`, error);
      return null;
    }
  };

  // Memoized rendering of all cursors
  const renderedCursors = useMemo(() => {
    if (!showCursors) return null;
    // Filter users who have cursor positions and are not offline/away
    return activeUsers
      .filter(user => user.cursor_position && user.status !== 'offline' && user.status !== 'away')
      .map(renderCursor)
      .filter(Boolean); // Filter out any nulls from render errors
  }, [activeUsers, showCursors]);


  // Connection Quality Indicator
  const getConnectionQualityIndicator = () => {
    const indicators = {
      good: { color: 'bg-green-500', message: 'Connection stable' },
      fair: { color: 'bg-yellow-500', message: 'Connection may have delays' },
      poor: { color: 'bg-red-500', message: 'Connection unstable or disconnected' }
    };
    const { color, message } = indicators[connectionQuality];
    return (
      <Tooltip>
        <TooltipTrigger asChild><div className={`w-2 h-2 rounded-full ${color} mr-1 cursor-help`}></div></TooltipTrigger>
        <TooltipContent side="top"><p>{message}</p></TooltipContent>
      </Tooltip>
    );
  };

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
                            <Button variant="link" size="sm" className="h-4 p-0 ml-1 text-xs" onClick={handleReconnect} disabled={isReconnecting}>
                                {isReconnecting ? <RotateCw className="h-3 w-3 animate-spin mr-1" /> : 'Reconnect'}
                            </Button>
                        )}
                    </AlertDescription>
                </Alert>
            )}

            {/* Status Row */}
            <div className="flex items-center mb-1">
                {getConnectionQualityIndicator()}
                {currentConnectionState === 'connected' ? <Wifi className="h-3 w-3 text-green-500 mr-1" /> :
                 currentConnectionState === 'connecting' ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> :
                 <WifiOff className="h-3 w-3 text-red-500 mr-1" />}
                <span className="text-xs font-medium capitalize">{currentConnectionState}</span>
                {reconnectAttempts > 0 && <span className="text-xs ml-1 text-muted-foreground">(Attempt {reconnectAttempts})</span>}
                <span className="text-xs ml-auto text-muted-foreground flex items-center"><Clock className="h-3 w-3 inline mr-1" />{lastUpdateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            {/* Cursor Toggle Button */}
            {activeUsers.some(user => user.cursor_position) && (
                <div className="mb-1">
                    <Button variant="ghost" size="sm" className="h-6 text-xs px-2 py-0" onClick={toggleCursorVisibility}>
                        <MousePointer className="h-3 w-3 mr-1" /> {showCursors ? 'Hide Cursors' : 'Show Cursors'}
                    </Button>
                </div>
            )}

            {/* Active Users Avatars */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex items-center -space-x-2 hover:space-x-0 transition-all duration-200 cursor-default">
                        {activeUsers.slice(0, 5).map((user: ExtendedUserPresence) => (
                            <Avatar key={user.user_id} className="h-6 w-6 border-2 border-background">
                                <AvatarImage src={user.avatar_url || undefined} />
                                <AvatarFallback className="text-[10px]">{getInitials(user.name || user.email || "U")}</AvatarFallback>
                            </Avatar>
                        ))}
                        {activeUsers.length > 5 && (
                            <Avatar className="h-6 w-6 border-2 border-background">
                                <AvatarFallback className="text-[10px] bg-muted">+{activeUsers.length - 5}</AvatarFallback>
                            </Avatar>
                        )}
                        {activeUsers.length === 0 && (
                            <span className="text-xs text-muted-foreground pl-1">No one else active</span>
                        )}
                    </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="end" className="max-w-xs p-3">
                    {/* Tooltip Content: User List */}
                    <div className="text-sm font-medium mb-2">{activeUsers.length} active user{activeUsers.length !== 1 ? 's' : ''}</div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {/* Editing Users */}
                        {usersByStatus.editing.length > 0 && (
                            <>
                                <p className="text-xs font-medium text-blue-500 flex items-center"><Edit className="h-3 w-3 mr-1" />Editing:</p>
                                {usersByStatus.editing.map((user: ExtendedUserPresence) => (
                                    <div key={user.user_id} className="flex items-center justify-between text-xs py-1">
                                        <span className="flex items-center gap-1.5">
                                            <Avatar className="h-5 w-5"><AvatarImage src={user.avatar_url || undefined} /><AvatarFallback className="text-[10px]">{getInitials(user.name || user.email || "U")}</AvatarFallback></Avatar>
                                            {user.name || user.email || "Unknown"}
                                        </span>
                                        {getStatusBadge(user.status)}
                                    </div>
                                ))}
                            </>
                        )}
                        {/* Online Users */}
                         {usersByStatus.online.length > 0 && (
                            <>
                                <p className="text-xs font-medium text-green-500 flex items-center mt-2"><Activity className="h-3 w-3 mr-1" />Online:</p>
                                {usersByStatus.online.map((user: ExtendedUserPresence) => (
                                     <div key={user.user_id} className="flex items-center justify-between text-xs py-1">
                                        <span className="flex items-center gap-1.5">
                                             <Avatar className="h-5 w-5"><AvatarImage src={user.avatar_url || undefined} /><AvatarFallback className="text-[10px]">{getInitials(user.name || user.email || "U")}</AvatarFallback></Avatar>
                                             {user.name || user.email || "Unknown"}
                                         </span>
                                         {getStatusBadge(user.status)}
                                         <Tooltip><TooltipTrigger asChild><Info className="h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger><TooltipContent><p>{getActivityInfo(user)}</p></TooltipContent></Tooltip>
                                     </div>
                                 ))}
                             </>
                         )}
                         {/* Away Users */}
                         {usersByStatus.away.length > 0 && (
                            <>
                                <p className="text-xs font-medium text-yellow-500 flex items-center mt-2"><Coffee className="h-3 w-3 mr-1" />Away:</p>
                                {usersByStatus.away.map((user: ExtendedUserPresence) => (
                                    <div key={user.user_id} className="flex items-center justify-between text-xs py-1">
                                        <span className="flex items-center gap-1.5">
                                             <Avatar className="h-5 w-5"><AvatarImage src={user.avatar_url || undefined} /><AvatarFallback className="text-[10px]">{getInitials(user.name || user.email || "U")}</AvatarFallback></Avatar>
                                             {user.name || user.email || "Unknown"}
                                         </span>
                                         {getStatusBadge(user.status)}
                                         <span className="text-muted-foreground italic">{formatTimeAgo(user.last_active)}</span>
                                     </div>
                                 ))}
                             </>
                         )}
                         {activeUsers.length === 0 && <p className="text-xs text-muted-foreground">No other users currently active.</p>}
                     </div>
                 </TooltipContent>
             </Tooltip>

             {/* Render cursors via portal */}
             {renderedCursors}
         </div>
     </TooltipProvider>
  );
}

// Default export
export default TripPresenceIndicator; 