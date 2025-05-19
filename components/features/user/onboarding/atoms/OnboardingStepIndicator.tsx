import React from 'react';

export interface OnboardingStepIndicatorProps {
  total: number;
  current: number;
  className?: string;
}

export function OnboardingStepIndicator({ total, current, className = '' }: OnboardingStepIndicatorProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`} aria-label="Onboarding progress">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`w-2.5 h-2.5 rounded-full transition-all ${
            i === current ? 'bg-primary scale-110 shadow' : 'bg-muted'
          }`}
          aria-current={i === current ? 'step' : undefined}
        />
      ))}
    </div>
  );
} 