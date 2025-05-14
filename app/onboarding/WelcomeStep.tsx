import React from 'react';
import HeroEmojiExplosion from '@/components/HeroEmojiExplosion';
import { Button } from '@/components/ui/button';

interface WelcomeStepProps {
  onboardingData: any;
  setOnboardingData: (data: any) => void;
  saveStep: (fields: any) => Promise<void>;
  setStep: (step: number) => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ setStep }) => {
  return (
    <div className="animate-fade-in-stagger flex flex-col items-center gap-6">
      <div className="relative w-full h-20 flex items-center justify-center mb-2">
        {/* Add @ts-ignore to suppress TypeScript error if the component's interface isn't defined properly */}
        {/* @ts-ignore */}
        <HeroEmojiExplosion
          emojis={['✈️', '🏝️', '🌄', '🧳', '🗺️', '🏞️', '🚗', '🏰', '🎒', '🧭']}
          size={24}
          interval={800}
        />
      </div>

      <h2 className="text-gradient text-2xl md:text-3xl font-bold text-center">
        Welcome to withme.travel!
      </h2>

      <div className="text-muted-foreground text-center max-w-md space-y-4">
        <p>We're so excited to help you plan your next group adventure with friends and family.</p>
        <p>
          This quick onboarding will help us personalize your experience and get you collaborating
          with your travel squad in no time.
        </p>
      </div>

      <div className="bubble-float mt-4">
        <Button
          className="px-8 py-6 h-auto rounded-full text-lg font-medium"
          onClick={() => setStep(2)}
        >
          Let's get started
        </Button>
      </div>
    </div>
  );
};

export default WelcomeStep;
