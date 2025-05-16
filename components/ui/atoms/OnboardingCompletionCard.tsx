import React from 'react';
import { OnboardingCompletionIllustration } from '../atoms/OnboardingCompletionIllustration';
import { OnboardingButton } from '../atoms/OnboardingButton';

export interface OnboardingCompletionCardProps {
  title: string;
  description?: string;
  onContinue?: () => void;
  continueLabel?: string;
  className?: string;
}

export function OnboardingCompletionCard({
  title,
  description,
  onContinue,
  continueLabel = 'Continue',
  className = '',
}: OnboardingCompletionCardProps) {
  return (
    <div className={`w-full max-w-md mx-auto bg-card rounded-xl shadow-lg p-8 flex flex-col items-center gap-6 ${className}`}>
      <OnboardingCompletionIllustration className="mb-2" />
      <h2 className="text-2xl font-bold text-center">{title}</h2>
      {description && <p className="text-muted-foreground text-center mb-4">{description}</p>}
      {onContinue && (
        <OnboardingButton onClick={onContinue} className="mt-2">
          {continueLabel}
        </OnboardingButton>
      )}
    </div>
  );
} 