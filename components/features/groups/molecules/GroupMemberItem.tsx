/**
 * GroupMemberItem Molecule
 *
 * Displays a group member with avatar, name, and actions.
 * @module components/features/groups/molecules/GroupMemberItem
 */

import React from 'react';

/**
 * GroupMemberItem component props
 */
export interface GroupMemberItemProps {
  /** Member name */
  name: string;
  /** Avatar URL */
  avatarUrl?: string;
  /** Member role */
  role?: string;
  /** Actions (e.g., promote, remove) */
  actions?: React.ReactNode;
  /** Additional className for styling */
  className?: string;
}

/**
 * GroupMemberItem molecule for group members (placeholder)
 */
export function GroupMemberItem({ name, avatarUrl, role, actions, className }: GroupMemberItemProps) {
  // TODO: Implement member item UI
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} style={{ width: 32, height: 32, borderRadius: '50%' }} />
      ) : (
        <span style={{ width: 32, height: 32, borderRadius: '50%', background: '#ccc', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{name.charAt(0)}</span>
      )}
      <span>{name}</span>
      {role && <span style={{ marginLeft: 8, fontSize: 12, color: '#888' }}>{role}</span>}
      {actions && <span style={{ marginLeft: 'auto' }}>{actions}</span>}
    </div>
  );
}

export default GroupMemberItem; 