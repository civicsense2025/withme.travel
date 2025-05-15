import React from 'react';
import { OnboardingCompletionCard } from '../molecules/OnboardingCompletionCard';

export interface OnboardingCompletionProps {
  onContinue?: () => void;
  className?: string;
}

export function OnboardingCompletion({ onContinue, className = '' }: OnboardingCompletionProps) {
  return (
    <OnboardingCompletionCard
      title="You're all set!"
      description="Your onboarding is complete. Start planning your next adventure!"
      onContinue={onContinue}
      continueLabel="Go to Dashboard"
      className={className}
    />
  );
} 