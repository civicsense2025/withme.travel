'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import * as Sentry from '@sentry/nextjs';
import { useNotes } from '@/hooks/use-notes';
import { NotesSkeleton } from '@/components/ui/features/trips/atoms/NotesSkeleton';
import { DestinationNotePrompt } from '@/components/ui/features/trips/atoms/DestinationNotePrompt';

// Dynamically import CollaborativeNotes with no SSR
const CollaborativeNotes = dynamic(
  () => import('@/components/collaborative-notes').then((mod) => mod.CollaborativeNotes),
  { ssr: false, loading: () => <NotesSkeleton /> }
);

interface NotesTabContentProps {
  tripId: string;
  canEdit: boolean;
  destinationName?: string;
  destinationDescription?: string;
  destinationHighlights?: string[];
}

/**
 * Notes tab content for trips
 */
export function NotesTabContent({
  tripId,
  canEdit,
  destinationName = '',
  destinationDescription = '',
  destinationHighlights = [],
}: NotesTabContentProps) {
  const [hasAddedDefaultNote, setHasAddedDefaultNote] = useState(false);
  
  // Use our new notes hook for API operations
  const { 
    content, 
    isLoading, 
    isSaving, 
    error, 
    updateContent 
  } = useNotes(tripId);

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
  }, [tripId, canEdit]);

  // Function to add default destination note
  const addDefaultDestinationNote = async () => {
    if (!canEdit) return;

    try {
      // Create content for the note
      const highlightsText =
        destinationHighlights.length > 0
          ? `\n\n## Highlights\n\n${destinationHighlights.map((h) => `- ${h}`).join('\n')}`
          : '';

      const defaultContent = `# About ${destinationName}
      
${destinationDescription}
${highlightsText}

## Local Information

Add details about local customs, language tips, and useful information here.
`;

      // Use the hook to update content
      await updateContent(defaultContent);
      setHasAddedDefaultNote(true);
    } catch (error) {
      console.error('Error creating default note:', error);
      Sentry.captureException(error, {
        tags: { action: 'createDefaultNote', tripId },
      });
    }
  };

  // During initial load, show skeleton
  if (isLoading) {
    return <NotesSkeleton />;
  }

  return (
    <div className="space-y-4">
      <CollaborativeNotes tripId={tripId} readOnly={!canEdit} />

      {canEdit && destinationName && !hasAddedDefaultNote && content.trim() === '' && (
        <DestinationNotePrompt 
          destinationName={destinationName}
          onAddClick={addDefaultDestinationNote}
          isLoading={isSaving}
        />
      )}
    </div>
  );
}
