/**
 * SuccessScreen Organism
 *
 * Displays a success message for onboarding completion.
 * @module components/features/onboarding/organisms/SuccessScreen
 */

import React from 'react';

/**
 * SuccessScreen component props
 */
export interface SuccessScreenProps {
  /** Optional message to display */
  message?: string;
  /** Additional className for styling */
  className?: string;
}

/**
 * SuccessScreen organism for onboarding (placeholder)
 */
export function SuccessScreen({ message = 'You are all set!', className }: SuccessScreenProps) {
  // TODO: Implement success UI
  return (
    <div className={className} style={{ textAlign: 'center', padding: 32 }}>
      <h2>🎉 Success!</h2>
      <p>{message}</p>
    </div>
  );
}

export default SuccessScreen; 