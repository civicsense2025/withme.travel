import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PersonalityStepProps {
  onboardingData: any;
  setOnboardingData: (data: any) => void;
  saveStep: (fields: any) => Promise<void>;
  setStep: (step: number) => void;
}

// Personality types with their icons and descriptions
const PERSONALITIES = [
  {
    id: 'planner',
    emoji: '📋',
    name: 'The Planner',
    description: 'You love detailed itineraries and having everything organized.',
  },
  {
    id: 'adventurer',
    emoji: '🧗',
    name: 'The Adventurer',
    description: 'You seek thrills and off-the-beaten-path experiences.',
  },
  {
    id: 'foodie',
    emoji: '🍽️',
    name: 'The Foodie',
    description: 'Your travels revolve around culinary experiences and local cuisine.',
  },
  {
    id: 'sightseer',
    emoji: '📸',
    name: 'The Sightseer',
    description: 'You want to see all the major landmarks and attractions.',
  },
  {
    id: 'relaxer',
    emoji: '🏖️',
    name: 'The Relaxer',
    description: 'Your idea of a vacation is unwinding and recharging.',
  },
  {
    id: 'culture',
    emoji: '🏛️',
    name: 'The Culture Seeker',
    description: 'You immerse yourself in local traditions, art, and history.',
  },
];

const PersonalityStep: React.FC<PersonalityStepProps> = ({
  onboardingData,
  setOnboardingData,
  saveStep,
}) => {
  const handleSelectPersonality = async (personality: string) => {
    setOnboardingData({
      ...onboardingData,
      travelPersonality: personality,
    });
    await saveStep({ travelPersonality: personality });
  };

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-2xl font-bold text-center mb-2">What's your travel personality?</h2>
      <p className="text-muted-foreground text-center mb-6">
        This helps us tailor recommendations to your travel style.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {PERSONALITIES.map((personality) => (
          <Card
            key={personality.id}
            onClick={() => handleSelectPersonality(personality.id)}
            className={`p-4 hover:shadow-md transition-all cursor-pointer hover-scale ${
              onboardingData.travelPersonality === personality.id
                ? 'ring-2 ring-primary bg-primary/5'
                : 'bg-card hover:bg-accent/10'
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="text-4xl mb-2">{personality.emoji}</div>
              <div className="font-medium text-sm">{personality.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{personality.description}</div>
            </div>
          </Card>
        ))}
      </div>

      {onboardingData.travelPersonality && (
        <div className="mt-6 text-center text-sm text-primary animate-fade-in">
          Great choice! This will help us personalize your experience.
        </div>
      )}
    </div>
  );
};

export default PersonalityStep;
