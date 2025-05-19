'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Personality types with their descriptions and associated tags
const personalities = [
  {
    id: 'adventurer',
    name: 'Adventurer',
    description: 'You seek thrills and outdoor activities',
    emoji: '🧗‍♂️',
    suggestedInterests: {
      'hiking': 80,
      'adventure': 90,
      'outdoors': 85,
      'nature': 75,
      'camping': 70,
    },
  },
  {
    id: 'culture-buff',
    name: 'Culture Buff',
    description: 'You love museums, history, and local traditions',
    emoji: '🏛️',
    suggestedInterests: {
      'museums': 90,
      'history': 85,
      'architecture': 80,
      'art': 75,
      'local-culture': 85,
    },
  },
  {
    id: 'foodie',
    name: 'Foodie',
    description: 'You travel for culinary experiences',
    emoji: '🍽️',
    suggestedInterests: {
      'food-dining': 95,
      'local-cuisine': 90,
      'food-tours': 85,
      'wineries': 75,
      'food-markets': 80,
    },
  },
  {
    id: 'relaxer',
    name: 'Relaxer',
    description: 'You seek peaceful, stress-free experiences',
    emoji: '🏖️',
    suggestedInterests: {
      'beaches': 90,
      'spa': 85,
      'relaxation': 95,
      'resort': 80,
      'wellness': 75,
    },
  },
];

interface TravelPersonalityScreenProps {
  onNext: (personalityId: string, suggestedInterests: Record<string, number>) => void;
  onBack: () => void;
  onSkip: () => void;
}

/**
 * Travel personality selection screen where users choose 
 * their travel style preference during onboarding
 */
export function TravelPersonalityScreen({
  onNext,
  onBack,
  onSkip,
}: TravelPersonalityScreenProps) {
  const [selectedPersonality, setSelectedPersonality] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedPersonality) {
      const selected = personalities.find((p) => p.id === selectedPersonality);
      if (selected) {
        onNext(selected.id, selected.suggestedInterests);
      }
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="pt-6 pb-8 px-6">
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-2xl font-bold">What's your travel style?</h2>
          <p className="text-muted-foreground">
            This helps us tailor recommendations for your trips
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          {personalities.map((personality) => (
            <Card
              key={personality.id}
              className={`p-4 cursor-pointer transition-all ${
                selectedPersonality === personality.id
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => setSelectedPersonality(personality.id)}
            >
              <div className="text-center">
                <div className="text-4xl mb-2">{personality.emoji}</div>
                <h3 className="font-medium">{personality.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{personality.description}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack} className="flex-1 lowercase">
              back
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!selectedPersonality}
              className="flex-1 lowercase"
            >
              continue
            </Button>
          </div>
          <Button variant="ghost" onClick={onSkip} className="text-muted-foreground">
            skip for now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 