/**
 * GroupMemberAvatar Atom
 *
 * Displays a group member's avatar.
 * @module components/features/groups/atoms/GroupMemberAvatar
 */

import React from 'react';

/**
 * GroupMemberAvatar component props
 */
export interface GroupMemberAvatarProps {
  /** Avatar image URL */
  avatarUrl?: string;
  /** Member name (for initials) */
  name?: string;
  /** Additional className for styling */
  className?: string;
}

/**
 * GroupMemberAvatar atom for group members (placeholder)
 */
export function GroupMemberAvatar({ avatarUrl, name, className }: GroupMemberAvatarProps) {
  // TODO: Implement avatar UI
  return (
    <span className={className}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={name || 'Group member'} style={{ width: 32, height: 32, borderRadius: '50%' }} />
      ) : (
        <span style={{ width: 32, height: 32, borderRadius: '50%', background: '#ccc', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          {name ? name.charAt(0) : '?'}
        </span>
      )}
    </span>
  );
}

export default GroupMemberAvatar; 