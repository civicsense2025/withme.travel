/**
 * CreateGroupModal Molecule
 *
 * Modal dialog for creating a new group.
 * @module components/features/groups/molecules/CreateGroupModal
 */

import React from 'react';

/**
 * CreateGroupModal component props
 */
export interface CreateGroupModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Callback when group is created */
  onGroupCreated?: (group: any) => void;
  /** Additional className for styling */
  className?: string;
}

/**
 * CreateGroupModal molecule for group creation (placeholder)
 */
export function CreateGroupModal({ open, onClose, onGroupCreated, className }: CreateGroupModalProps) {
  // TODO: Implement modal UI
  if (!open) return null;
  return (
    <div className={className} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', zIndex: 1000 }}>
      <div style={{ background: '#fff', margin: '10% auto', padding: 24, borderRadius: 8, maxWidth: 400 }}>
        <h2>Create Group</h2>
        {/* TODO: Add CreateGroupForm here */}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default CreateGroupModal; 