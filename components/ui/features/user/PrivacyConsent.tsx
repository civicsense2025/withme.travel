'use client';

import React from 'react';

export interface PrivacyConsentProps {
  /**
   * Privacy message to display
   * @default 'We respect your privacy. Your info is only used for the user testing program. Opt out anytime.'
   */
  message?: string;
  
  /**
   * Show a heading before the message
   * @default true
   */
  showHeading?: boolean;
  
  /**
   * Heading text
   * @default 'Privacy & Consent:'
   */
  heading?: string;
  
  /**
   * Additional CSS class for the component
   */
  className?: string;
}

/**
 * Component for displaying privacy consent information
 */
export function PrivacyConsent({
  message = 'We respect your privacy. Your info is only used for the user testing program. Opt out anytime.',
  showHeading = true,
  heading = 'Privacy & Consent:',
  className = '',
}: PrivacyConsentProps) {
  return (
    <div className={`mt-6 py-4 px-6 bg-card border border-border rounded-xl text-sm text-muted-foreground text-center max-w-sm mx-auto ${className}`}>
      {showHeading && <span className="font-semibold text-foreground">{heading}</span>} {message}
    </div>
  );
} 