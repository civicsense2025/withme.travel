'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ClientFocusMode } from './client-focus-mode';
import { Coffee } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface FocusToggleProps {
  tripId: string;
  canEdit: boolean;
}

export function FocusToggle({ tripId, canEdit }: FocusToggleProps) {
  const [showFocusMode, setShowFocusMode] = useState(false);

  if (!canEdit) {
    return null;
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setShowFocusMode(!showFocusMode)}
            className="h-8 w-8"
          >
            <Coffee className={`h-4 w-4 transition-colors ${showFocusMode ? 'text-primary' : 'text-muted-foreground'}`} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{showFocusMode ? 'Hide' : 'Show'} Focus Mode</p>
        </TooltipContent>
      </Tooltip>

      {showFocusMode && (
        <div className="container mx-auto px-4 py-2 sticky top-[60px] z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <ClientFocusMode tripId={tripId} />
        </div>
      )}
    </>
  );
} 