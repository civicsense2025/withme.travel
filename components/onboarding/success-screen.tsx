'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SuccessScreenProps {
  onCreateTrip: () => void;
  onExplore: () => void;
}

export function SuccessScreen({ onCreateTrip, onExplore }: SuccessScreenProps) {
  return (
    <Card className="w-full">
      <CardContent className="p-6 text-center">
        <div className="mb-6 mx-auto flex justify-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
            <span className="text-2xl">🎉</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">You're all set!</h2>
        <p className="text-muted-foreground mb-8">
          Your profile is complete. Now you can start planning your first trip or explore the app.
        </p>
        <div className="space-y-3">
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
