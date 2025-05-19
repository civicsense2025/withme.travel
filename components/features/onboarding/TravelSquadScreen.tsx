'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserPlus, Heart, User, Briefcase, Users2 } from 'lucide-react';

interface TravelSquadScreenProps {
  userData: {
    travelSquad: string;
  };
  onInputChange: (field: string, value: string) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export function TravelSquadScreen({
  userData,
  onInputChange,
  onNext,
  onBack,
  onSkip,
}: TravelSquadScreenProps) {
  const squads = [
    { id: 'friends', label: 'friends', icon: Users, description: 'Adventure is better together' },
    { id: 'family', label: 'family', icon: Users2, description: 'Making memories with loved ones' },
    { id: 'partner', label: 'partner', icon: Heart, description: 'Romantic getaways' },
    { id: 'solo', label: 'solo', icon: User, description: 'Independent but social' },
    {
      id: 'coworkers',
      label: 'coworkers',
      icon: Briefcase,
      description: 'Mixing business & pleasure',
    },
    {
      id: 'mixed',
      label: 'mixed crew',
      icon: UserPlus,
      description: 'Different groups, different trips',
    },
  ];

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="pt-6 pb-8 px-6">
        <div className="text-center mb-6">
          <div className="mb-4 text-4xl">👯‍♀️</div>
          <h1 className="text-5xl leading-loose font-bold mb-2">who do you usually travel with?</h1>
          <p className="text-muted-foreground mb-4">
            Choose your typical travel companions (or skip for now)
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {squads.map((squad) => {
            const Icon = squad.icon;
            return (
              <Button
                key={squad.id}
                variant={userData.travelSquad === squad.id ? 'default' : 'outline'}
                className="w-full justify-start text-left py-6 px-4 group"
                onClick={() => onInputChange('travelSquad', squad.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-muted group-hover:scale-110 transition-transform">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">{squad.label}</div>
                    <div className="text-xs text-muted-foreground">{squad.description}</div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack} className="flex-1">
              back
            </Button>
            <Button onClick={onNext} className="flex-1" disabled={!userData.travelSquad}>
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
