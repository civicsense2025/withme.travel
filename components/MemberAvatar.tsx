import React from 'react';
import { MemberData } from '@/utils/constants/groupCirclesConstants'; // Adjust path

interface AvatarStyleProps {
  width: number;
  height: number;
  fontSize: string;
}

interface MemberAvatarProps {
  member?: MemberData; // Optional for the '+N' case
  styleProps: AvatarStyleProps;
  positionStyle: React.CSSProperties;
  isExtraCounter?: boolean;
  extraCount?: number;
  borderColor?: string; // e.g. 'white'
}

export const MemberAvatar: React.FC<MemberAvatarProps> = ({
  member,
  styleProps,
  positionStyle,
  isExtraCounter = false,
  extraCount = 0,
  borderColor = 'white',
}) => {
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