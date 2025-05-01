'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SuccessScreenProps {
  onCreateTrip: () => void;
  onExplore: () => void;
}

export function SuccessScreen({ onCreateTrip, onExplore }: SuccessScreenProps) {
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="pt-6 pb-8 px-6 text-center">
        <div className="mb-6 text-4xl">🎉</div>
        <div className="text-center max-w-lg mx-auto">
          <h1 className="text-5xl leading-loose font-bold mb-2">you're all set!</h1>
          <p className="text-muted-foreground mb-8">
            your profile is complete. let's start planning your next adventure!
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button onClick={onCreateTrip} size="lg" className="w-full">
            create my first trip
          </Button>
          <Button variant="outline" size="lg" className="w-full" onClick={onExplore}>
            explore the app
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
