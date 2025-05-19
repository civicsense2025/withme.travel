import React, { useState } from 'react';
import { OnboardingStepForm } from '../molecules/OnboardingStepForm';
import { OnboardingCompletionCard } from '../molecules/OnboardingCompletionCard';

export interface OnboardingFlowProps {
  onComplete?: () => void;
  className?: string;
}

// Example steps: name, travel style, interests
const steps = [
  {
    title: 'Welcome! What should we call you?',
    description: 'Let us know your preferred name.',
    field: 'name',
    placeholder: 'Your name',
    required: true,
  },
  {
    title: 'What best describes your travel style?',
    description: 'Pick the option that fits you best.',
    field: 'travelStyle',
    placeholder: 'e.g. Adventurer, Relaxer, Planner...',
    required: true,
  },
  {
    title: 'What are your top travel interests?',
    description: 'Separate with commas (e.g. food, hiking, museums)',
    field: 'interests',
    placeholder: 'Interests',
    required: false,
  },
];

export function OnboardingFlow({ onComplete, className = '' }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<{ name: string; travelStyle: string; interests: string }>({
    name: '',
    travelStyle: '',
    interests: '',
  });
  const [completed, setCompleted] = useState(false);

  const current = steps[step];
  const totalSteps = steps.length;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [current.field]: e.target.value }));
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
    } else {
      setCompleted(true);
      if (onComplete) onComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  if (completed) {
    return (
      <OnboardingCompletionCard
        title="You're all set!"
        description="Your profile is ready. Start planning your next adventure with friends."
        onContinue={onComplete}
        continueLabel="Go to Dashboard"
        className={className}
      />
    );
  }

  return (
    <OnboardingStepForm
      step={step}
      totalSteps={totalSteps}
      title={current.title}
      description={current.description}
      fields={
        <input
          type="text"
          name={current.field}
          placeholder={current.placeholder}
          value={form[current.field as keyof typeof form]}
          onChange={handleChange}
          className="w-full rounded-lg border-2 border-muted focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all px-3 py-2"
          required={current.required}
        />
      }
      onNext={handleNext}
      onBack={step > 0 ? handleBack : undefined}
      nextLabel={step === totalSteps - 1 ? 'Finish' : 'Next'}
      isNextDisabled={current.required && !form[current.field as keyof typeof form]}
      className={className}
    />
  );
} 