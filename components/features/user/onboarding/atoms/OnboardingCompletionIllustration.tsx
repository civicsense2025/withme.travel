import React from 'react';

export function OnboardingCompletionIllustration({ className = '' }: { className?: string }) {
  // Placeholder: Replace with a real SVG or animation later
  return (
    <div className={`flex items-center justify-center ${className}`} aria-hidden="true">
      <span className="text-6xl">🎉</span>
    </div>
  );
} 