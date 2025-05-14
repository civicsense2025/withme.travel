import React from 'react';
import { Card } from '@/components/ui/card';

interface SquadStepProps {
  onboardingData: any;
  setOnboardingData: (data: any) => void;
  saveStep: (fields: any) => Promise<void>;
  setStep: (step: number) => void;
}

// Travel squad types
const TRAVEL_SQUADS = [
  {
    id: 'friends',
    emoji: '👯',
    name: 'Friends',
    description: 'Weekend getaways, milestone celebrations, or just because!',
  },
  {
    id: 'family',
    emoji: '👨‍👩‍👧‍👦',
    name: 'Family',
    description: 'Quality time with loved ones of all generations.',
  },
  {
    id: 'couple',
    emoji: '💑',
    name: 'Partner',
    description: 'Romantic escapes and adventures for two.',
  },
  {
    id: 'solo',
    emoji: '🧘',
    name: 'Solo+',
    description: 'Travel on your own but meet others along the way.',
  },
  {
    id: 'colleagues',
    emoji: '💼',
    name: 'Colleagues',
    description: 'Team building trips and work retreats.',
  },
  {
    id: 'mixed',
    emoji: '🌈',
    name: 'Mixed Group',
    description: 'A bit of everything - friends, family, and more!',
  },
];

const SquadStep: React.FC<SquadStepProps> = ({ onboardingData, setOnboardingData, saveStep }) => {
  const handleSelectSquad = async (squad: string) => {
    setOnboardingData({
      ...onboardingData,
      travelSquad: squad,
    });
    await saveStep({ travelSquad: squad });
  };

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-2xl font-bold text-center mb-2">Who do you travel with most?</h2>
      <p className="text-muted-foreground text-center mb-6">
        We'll customize features for your travel companions.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {TRAVEL_SQUADS.map((squad) => (
          <Card
            key={squad.id}
            onClick={() => handleSelectSquad(squad.id)}
            className={`p-4 hover:shadow-md transition-all cursor-pointer hover-scale ${
              onboardingData.travelSquad === squad.id
                ? 'ring-2 ring-primary bg-primary/5'
                : 'bg-card hover:bg-accent/10'
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="text-4xl mb-2">{squad.emoji}</div>
              <div className="font-medium text-sm">{squad.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{squad.description}</div>
            </div>
          </Card>
        ))}
      </div>

      {onboardingData.travelSquad && (
        <div className="mt-6 text-center text-sm text-primary animate-fade-in">
          Perfect! We'll help you plan amazing trips with your{' '}
          {TRAVEL_SQUADS.find((s) => s.id === onboardingData.travelSquad)?.name.toLowerCase()}.
        </div>
      )}
    </div>
  );
};

export default SquadStep;
