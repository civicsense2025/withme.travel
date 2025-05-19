/**
 * AuthModal Organism
 *
 * Modal dialog for authentication (login/signup).
 * @module components/features/auth/organisms/AuthModal
 */

import React from 'react';

/**
 * AuthModal component props
 */
export interface AuthModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Additional className for styling */
  className?: string;
}

/**
 * AuthModal organism for authentication (placeholder)
 */
export function AuthModal({ open, onClose, className }: AuthModalProps) {
  // TODO: Implement auth modal UI
  if (!open) return null;
  return (
    <div className={className} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', zIndex: 1000 }}>
      <div style={{ background: '#fff', margin: '10% auto', padding: 24, borderRadius: 8, maxWidth: 400 }}>
        <h2>Sign In / Sign Up</h2>
        {/* TODO: Add auth form here */}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default AuthModal; 