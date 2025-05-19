/**
 * GroupMemberSearch Molecule
 *
 * Search input for finding group members.
 * @module components/features/groups/molecules/GroupMemberSearch
 */

import React from 'react';

/**
 * GroupMemberSearch component props
 */
export interface GroupMemberSearchProps {
  /** Callback when search changes */
  onSearch?: (query: string) => void;
  /** Current search value */
  value?: string;
  /** Additional className for styling */
  className?: string;
}

/**
 * GroupMemberSearch molecule for group members (placeholder)
 */
export function GroupMemberSearch({ onSearch, value, className }: GroupMemberSearchProps) {
  // TODO: Implement search input UI
  return (
    <input
      type="text"
      className={className}
      placeholder="Search members..."
      value={value}
      onChange={e => onSearch?.(e.target.value)}
    />
  );
}

export default GroupMemberSearch; 