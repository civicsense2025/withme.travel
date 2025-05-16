'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClientFocusMode } from './client-focus-mode';
import { Coffee, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface FocusModeDemoProps {
  tripId: string;
}

export function FocusModeDemo({ tripId }: FocusModeDemoProps) {
  const [showFocusMode, setShowFocusMode] = useState(false);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Focus Mode</CardTitle>
          <CardDescription>
            Collaborate in real-time and stay focused on your trip planning with Focus Mode.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Beta Feature</AlertTitle>
            <AlertDescription>
              Focus Mode is currently in beta. Try it out and let us know what you think!
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant={showFocusMode ? 'secondary' : 'outline'}
            onClick={() => setShowFocusMode(!showFocusMode)}
          >
            {showFocusMode ? 'Hide Focus Mode' : 'Show Focus Mode'}
          </Button>
          <Button variant="link" onClick={() => window.open('/docs/focus-mode', '_blank')}>
            Learn more
          </Button>
        </CardFooter>
      </Card>

      {showFocusMode && (
        <Card>
          <CardContent className="pt-6">
            <ClientFocusMode tripId={tripId} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
