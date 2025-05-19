/**
 * GroupIdeaBadge Atom
 *
 * Displays a badge for a group idea (e.g., type, status).
 * @module components/features/groups/atoms/GroupIdeaBadge
 */

import React from 'react';

/**
 * GroupIdeaBadge component props
 */
export interface GroupIdeaBadgeProps {
  /** Badge label */
  label: string;
  /** Optional color */
  color?: string;
  /** Additional className for styling */
  className?: string;
}

/**
 * GroupIdeaBadge atom for group ideas (placeholder)
 */
export function GroupIdeaBadge({ label, color, className }: GroupIdeaBadgeProps) {
  // TODO: Implement badge UI
  return (
    <span className={className} style={{ backgroundColor: color || '#eee', padding: '0.25em 0.5em', borderRadius: '0.5em' }}>
      {label}
    </span>
  );
}

export default GroupIdeaBadge; 