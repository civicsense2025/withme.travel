'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

// Dynamically import CollaborativeNotes with no SSR
const CollaborativeNotes = dynamic(
  () => import('@/components/collaborative-notes').then((mod) => mod.CollaborativeNotes),
  { ssr: false, loading: () => <Skeleton className="h-64 w-full" /> }
);

interface NotesTabContentProps {
  tripId: string;
  canEdit: boolean;
  destinationName?: string;
  destinationDescription?: string;
  destinationHighlights?: string[];
}

export function NotesTabContent({ 
  tripId, 
  canEdit,
  destinationName = '',
  destinationDescription = '',
  destinationHighlights = []
}: NotesTabContentProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasAddedDefaultNote, setHasAddedDefaultNote] = useState(false);

  // Track component load in Sentry
  useEffect(() => {
    Sentry.addBreadcrumb({
      category: 'component',
      message: 'Notes tab loaded',
      level: 'info',
      data: {
        tripId,
        canEdit,
      },
    });

    // Simulate loading state for SSR hydration
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [tripId, canEdit]);

  // Function to add default destination note
  const addDefaultDestinationNote = async () => {
    if (!canEdit) return;
    
    try {
      setIsLoading(true);
      
      // Create content for the note
      const highlightsText = destinationHighlights.length > 0 
        ? `\n\n## Highlights\n\n${destinationHighlights.map(h => `- ${h}`).join('\n')}` 
        : '';
      
      const content = `# About ${destinationName}
      
${destinationDescription}
${highlightsText}

## Local Information

Add details about local customs, language tips, and useful information here.
`;

      // Create a new note with the destination information
      const response = await fetch(`/api/trips/${tripId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `About ${destinationName}`,
          content,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create default destination note');
      }

      setHasAddedDefaultNote(true);
    } catch (error) {
      console.error('Error creating default note:', error);
      Sentry.captureException(error, {
        tags: { action: 'createDefaultNote', tripId },
      });
    } finally {
      setIsLoading(false);
    }
  };

  // During initial load, show skeleton
  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="space-y-4">
      <CollaborativeNotes tripId={tripId} readOnly={!canEdit} />

      {canEdit && destinationName && !hasAddedDefaultNote && (
        <div className="mt-4 p-4 border rounded-lg bg-muted/50">
          <h3 className="text-lg font-medium mb-2">Add Destination Information</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add a default note with information about {destinationName} to help your group learn about your destination.
          </p>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={addDefaultDestinationNote}
          >
            <PlusCircle className="h-4 w-4" />
            Add Destination Note
          </Button>
        </div>
      )}
    </div>
  );
}
