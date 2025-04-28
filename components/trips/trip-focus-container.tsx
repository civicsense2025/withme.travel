'use client';

import { ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Coffee } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ClientFocusMode } from './client-focus-mode';

interface TripFocusContainerProps {
  tripId: string;
  canEdit: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * A container component that wraps trip-related pages and adds focus mode functionality
 */
export function TripFocusContainer({ 
  tripId, 
  canEdit, 
  children,
  className = "" 
}: TripFocusContainerProps) {
  const [showFocusMode, setShowFocusMode] = useState(false);

  return (
    <TooltipProvider>
      <div className={`min-h-screen flex flex-col ${className}`}>
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
          {canEdit && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setShowFocusMode(!showFocusMode)}
                  className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                >
                  <Coffee className={`h-4 w-4 transition-colors ${showFocusMode ? 'text-primary' : 'text-muted-foreground'}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{showFocusMode ? 'Hide' : 'Show'} Focus Mode</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {showFocusMode && canEdit && (
          <div className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="container mx-auto px-4 py-2">
              <ClientFocusMode tripId={tripId} />
            </div>
          </div>
        )}

        {children}
      </div>
    </TooltipProvider>
  );
} 