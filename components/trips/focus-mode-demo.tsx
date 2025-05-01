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
          <CardTitle className="flex items-center gap-2">
            <Coffee className="h-5 w-5" />
            Focus Mode Demo
          </CardTitle>
          <CardDescription>
            Focus Mode helps team members collaborate in real-time on specific sections of a trip
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>What is Focus Mode?</AlertTitle>
            <AlertDescription>
              When you start a focus session, other team members will see what you're working on.
              They can join your session to collaborate on that specific part of the trip planning.
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
