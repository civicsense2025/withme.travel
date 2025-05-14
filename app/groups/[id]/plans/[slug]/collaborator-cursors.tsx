// Fixed CollaboratorCursors Component
'use client';

import React, { useEffect, useState } from 'react';
import { useIdeasPresenceContext } from './context/ideas-presence-context';
import { useAuth } from '@/components/auth-provider';
import { motion, AnimatePresence } from 'framer-motion';

interface CollaboratorCursorsProps {
  containerRef: React.RefObject<HTMLDivElement>;
  showCursors?: boolean; // If false, only show current user's cursor
}

// Add a type for activeUsers if not already imported
interface ActiveUser {
  id: string;
  name: string;
  cursor?: { x: number; y: number };
  editing_idea_id?: string;
  avatar_url?: string;
}

// Add useUniqueActiveUsers definition (move to utils if needed)
function useUniqueActiveUsers<T extends { id: string; lastSeen?: Date }>(
  rawActiveUsers: T[] = []
): T[] {
  return React.useMemo(() => {
    const validUsers = rawActiveUsers.filter(
      (user) => user && typeof user.id === 'string' && user.id.length > 0
    );
    const userMap = new Map<string, T>();
    for (const user of validUsers) {
      const existing = userMap.get(user.id);
      if (!existing || (user.lastSeen && existing?.lastSeen && user.lastSeen > existing.lastSeen)) {
        userMap.set(user.id, user);
      }
    }
    return Array.from(userMap.values());
  }, [rawActiveUsers]);
}

// Memoized cursor bubble
const CursorBubble = React.memo(function CursorBubble({
  user,
  containerRect,
}: {
  user: ActiveUser;
  containerRect: DOMRect | null;
}) {
  if (!user.cursor || !containerRect) return null;
  // If you want to filter out the current user's cursor, do it in the parent render loop.

  // Offset bubble to top-right
  const offsetX = user.cursor.x - containerRect.left;
  const offsetY = user.cursor.y - containerRect.top;

  // Generate user color based on user ID for consistency
  const userColor = generateUserColor(user.id);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 10 }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 30,
        mass: 1,
      }}
      className="absolute pointer-events-none z-50 flex flex-col items-center cursor-overlay"
      style={{
        left: `${offsetX}px`,
        top: `${offsetY}px`,
        transform: 'translate(-50%, -50%)',
      }}
      aria-label={`${user.name}'s cursor`}
    >
      {/* Actual cursor */}
      <motion.svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        className="drop-shadow-md"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
      >
        <path
          d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.93934 16.4371L4.81853 1.49482L4.83198 1.44186L4.83342 1.38693L4.91288 1.31082L4.97272 1.30946L5.02136 1.28086L5.06006 1.29354L5.0986 1.26648L5.16559 1.21983L20.1397 16.2823L16.1787 11.9265L16.0492 11.7843L16 11.5882V11.3947L16.0492 11.2526L16.1787 11.1103L20.1397 6.75459L5.16559 1.21983C5.16559 1.21983 5.3844 1.02422 5.46026 1.13975C5.53613 1.25529 5.65376 12.3673 5.65376 12.3673Z"
          fill={userColor}
          stroke="white"
          strokeWidth="1.5"
          transform="translate(-3, -3) rotate(0)"
        />
      </motion.svg>

      {/* User info bubble */}
      <motion.div
        className="absolute whitespace-nowrap px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium text-white -mt-1 pointer-events-none"
        style={{
          backgroundColor: userColor,
          transform: 'translateY(-100%)',
          top: '-8px',
          left: '16px',
        }}
        initial={{ opacity: 0, scale: 0.8, y: -5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt=""
            className="w-5 h-5 rounded-full border border-white/30"
          />
        ) : (
          <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-[10px] uppercase">
            {user.name.charAt(0)}
          </div>
        )}
        {user.name}
        {user.editing_idea_id && (
          <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-sm text-[10px]">Editing</span>
        )}
      </motion.div>
    </motion.div>
  );
});

export default function CollaboratorCursors({
  containerRef,
  showCursors = true,
}: CollaboratorCursorsProps) {
  const { activeUsers } = useIdeasPresenceContext();
  const { user } = useAuth();
  const currentUserId = user?.id || 'guest';
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);

  // Update container rect on resize
  useEffect(() => {
    const updateRect = () => {
      if (containerRef && containerRef.current) {
        setContainerRect(containerRef.current.getBoundingClientRect());
      }
    };

    // Initial update
    updateRect();

    let resizeObserver: ResizeObserver | null = null;
    if (containerRef && containerRef.current) {
      resizeObserver = new ResizeObserver(updateRect);
      resizeObserver.observe(containerRef.current);
    }

    // Updated window resize handler
    const handleResize = () => {
      updateRect();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);

      if (resizeObserver && containerRef && containerRef.current) {
        try {
          resizeObserver.unobserve(containerRef.current);
        } catch (e) {
          // ignore if already unobserved
        }
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [containerRef]);

  // Deduplicate users by ID
  const uniqueUsers = useUniqueActiveUsers(activeUsers as any[]);

  if (!uniqueUsers.length) {
    return (
      <div className="absolute top-2 left-2 text-xs text-gray-400 pointer-events-none">
        No collaborators online
      </div>
    );
  }

  const maxCursors = 10;
  const visibleUsers = showCursors
    ? uniqueUsers.slice(0, maxCursors)
    : uniqueUsers.filter((u) => u.id === currentUserId);
  const extraCount = uniqueUsers.length - maxCursors;

  return (
    <div className="absolute inset-0 pointer-events-none cursor-overlay">
      <AnimatePresence>
        {visibleUsers.map((u) => {
          if (!u.cursor || !containerRect) return null;
          return <CursorBubble key={u.id} user={u} containerRect={containerRect} />;
        })}
        {extraCount > 0 && (
          <div className="absolute top-2 right-2 bg-white/80 rounded px-2 py-1 text-xs shadow z-50 pointer-events-none">
            +{extraCount} more
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Generate a consistent color based on user ID
function generateUserColor(userId: string): string {
  // List of vibrant, accessible colors
  const colors = [
    '#FF5E5B', // coral red
    '#4CB944', // bright green
    '#775ADA', // purple
    '#0086D6', // bright blue
    '#FFA530', // orange
    '#00BFB2', // teal
    '#FF7DA9', // pink
    '#8C52FF', // violet
  ];

  // Hash the user ID to get a consistent index
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }

  // Use the absolute value of hash to get a positive number
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}
