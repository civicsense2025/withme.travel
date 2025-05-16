/**
 * MemberAvatar Component
 *
 * Displays a member avatar in group circles with flexible positioning and styling.
 * Supports both member faces and numeric indicators for additional group members.
 */

// ============================================================================
// IMPORTS
// ============================================================================

import React from 'react';
import { MemberData } from '@/utils/constants/groupCirclesConstants';

// ============================================================================
// TYPES
// ============================================================================

/** Sizing properties for avatar display */
interface AvatarStyleProps {
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
  /** Font size for text content */
  fontSize: string;
}

/** Props for the MemberAvatar component */
export interface MemberAvatarProps {
  /** Member data to display (optional for +N counter case) */
  member?: MemberData;
  /** Size properties for the avatar */
  styleProps: AvatarStyleProps;
  /** Positioning style (typically absolute positioning) */
  positionStyle: React.CSSProperties;
  /** Whether this avatar is showing a count of additional members */
  isExtraCounter?: boolean;
  /** Count of additional members to display */
  extraCount?: number;
  /** Border color for the avatar */
  borderColor?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * MemberAvatar - Visual representation of a group member
 * 
 * @example
 * <MemberAvatar
 *   member={memberData}
 *   styleProps={{ width: 40, height: 40, fontSize: '1rem' }}
 *   positionStyle={{ top: '50%', left: '50%' }}
 *   borderColor="#ffffff"
 * />
 */
export function MemberAvatar({
  member,
  styleProps,
  positionStyle,
  isExtraCounter = false,
  extraCount = 0,
  borderColor = 'white',
}: MemberAvatarProps) {
  const baseAvatarStyle: React.CSSProperties = {
    position: 'absolute',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: `2px solid ${borderColor}`,
    zIndex: 20, // Above group circle content, below active elements like modal
    ...styleProps,
    ...positionStyle, // This includes left, top, transform
  };

  if (isExtraCounter) {
    return (
      <div
        style={{
          ...baseAvatarStyle,
          backgroundColor: '#e5e7eb', // Consider theming these colors
          color: '#6b7280',
        }}
      >
        +{extraCount}
      </div>
    );
  }

  if (!member) return null;

  return (
    <div style={{ ...baseAvatarStyle, backgroundColor: member.color }}>
      {member.emoji}
    </div>
  );
}; 