import React from 'react';
import { Card } from '@/components/ui/card';
import { CheckIcon } from 'lucide-react';

interface ConfirmationStepProps {
  onboardingData: any;
  setOnboardingData: (data: any) => void;
  saveStep: (fields: any) => Promise<void>;
  setStep: (step: number) => void;
}

// Label mappings for personality types
const PERSONALITY_LABELS: Record<string, string> = {
  planner: 'The Planner',
  adventurer: 'The Adventurer',
  foodie: 'The Foodie',
  sightseer: 'The Sightseer',
  relaxer: 'The Relaxer',
  culture: 'The Culture Seeker',
};

// Label mappings for travel squad types
const SQUAD_LABELS: Record<string, string> = {
  friends: 'Friends',
  family: 'Family',
  couple: 'Partner',
  solo: 'Solo+',
  colleagues: 'Colleagues',
  mixed: 'Mixed Group',
};

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({ onboardingData }) => {
  const personalityLabel = onboardingData.travelPersonality
    ? PERSONALITY_LABELS[onboardingData.travelPersonality]
    : 'Not specified';

  const squadLabel = onboardingData.travelSquad
    ? SQUAD_LABELS[onboardingData.travelSquad]
    : 'Not specified';

  const locationName = onboardingData.homeLocationName || 'Not specified';

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-2xl font-bold text-center mb-2">Perfect! You're all set.</h2>
      <p className="text-muted-foreground text-center mb-6">
        Here's a summary of your preferences:
      </p>

      <div className="space-y-4">
        <Card className="p-4 bg-card hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <CheckIcon size={16} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium">Travel Personality</h3>
              <p className="text-primary font-semibold">{personalityLabel}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <CheckIcon size={16} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium">Travel Squad</h3>
              <p className="text-primary font-semibold">{squadLabel}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <CheckIcon size={16} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium">Home City</h3>
              <p className="text-primary font-semibold">{locationName}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-8 text-center animate-fade-in">
        <div className="text-4xl mb-4">🎉</div>
        <p className="text-muted-foreground">
          We'll use these preferences to personalize your experience. Ready to start planning your
          next adventure?
        </p>
      </div>
    </div>
  );
};

export default ConfirmationStep;
