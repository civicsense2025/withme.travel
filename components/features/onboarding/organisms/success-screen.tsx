'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SuccessScreenProps {
  onComplete: () => void;
  userName?: string;
}

/**
 * Success screen shown after successful registration
 * Displays a welcome message and button to continue
 */
export function SuccessScreen({ onComplete, userName = 'traveler' }: SuccessScreenProps) {
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="pt-6 pb-8 px-6 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold mb-2">Welcome aboard!</h1>
        <p className="text-xl mb-6">
          Congrats, {userName}! Your account has been created successfully.
        </p>
        <p className="text-muted-foreground mb-8">
          You're all set to start planning amazing trips with friends and family.
        </p>
        <Button onClick={onComplete} size="lg" className="lowercase">
          let's get started
        </Button>
      </CardContent>
    </Card>
  );
} 