import React from 'react';
import { OnboardingInput } from '../atoms/OnboardingInput';
import { OnboardingButton } from '../atoms/OnboardingButton';
import { OnboardingStepIndicator } from '../atoms/OnboardingStepIndicator';

export interface OnboardingStepFormProps {
  step: number;
  totalSteps: number;
  title: string;
  description?: string;
  fields: React.ReactNode;
  onNext: () => void;
  onBack?: () => void;
  nextLabel?: string;
  backLabel?: string;
  isNextDisabled?: boolean;
  className?: string;
}

export function OnboardingStepForm({
  step,
  totalSteps,
  title,
  description,
  fields,
  onNext,
  onBack,
  nextLabel = 'Next',
  backLabel = 'Back',
  isNextDisabled = false,
  className = '',
}: OnboardingStepFormProps) {
  return (
    <div className={`w-full max-w-md mx-auto bg-card rounded-xl shadow-lg p-8 flex flex-col gap-6 ${className}`}>
      <OnboardingStepIndicator total={totalSteps} current={step} className="mb-4" />
      <div>
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        {description && <p className="text-muted-foreground mb-4">{description}</p>}
      </div>
      <form className="flex flex-col gap-4" onSubmit={e => { e.preventDefault(); onNext(); }}>
        {fields}
        <div className="flex gap-2 mt-6">
          {onBack && (
            <OnboardingButton type="button" variant="outline" onClick={onBack}>
              {backLabel}
            </OnboardingButton>
          )}
          <OnboardingButton type="submit" disabled={isNextDisabled}>
            {nextLabel}
          </OnboardingButton>
        </div>
      </form>
    </div>
  );
} 