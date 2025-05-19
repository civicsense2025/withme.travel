/**
 * GroupMemberBadge Atom
 *
 * Displays a badge for a group member (e.g., role).
 * @module components/features/groups/atoms/GroupMemberBadge
 */

import React from 'react';

/**
 * GroupMemberBadge component props
 */
export interface GroupMemberBadgeProps {
  /** Badge label (e.g., role) */
  label: string;
  /** Optional color */
  color?: string;
  /** Additional className for styling */
  className?: string;
}

/**
 * GroupMemberBadge atom for group members (placeholder)
 */
export function GroupMemberBadge({ label, color, className }: GroupMemberBadgeProps) {
  // TODO: Implement badge UI
  return (
    <span className={className} style={{ backgroundColor: color || '#eee', padding: '0.25em 0.5em', borderRadius: '0.5em' }}>
      {label}
    </span>
  );
}

export default GroupMemberBadge; 