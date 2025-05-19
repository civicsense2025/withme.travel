'use client';

import { useEffect, useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import { useNotes } from '@/lib/hooks/use-notes';
import { Skeleton } from '@/components/ui/skeleton';
import { NotesTabTemplate } from '@/components/features/notes';
import { useToast } from '@/lib/hooks/use-toast';

interface NotesTabContentProps {
  tripId: string;
  canEdit: boolean;
  destinationName?: string;
  destinationDescription?: string;
  destinationHighlights?: string[];
}

/**
 * Notes tab content for trips - uses atomized components
 */
export function NotesTabContent({
  tripId,
  canEdit,
  destinationName = '',
  destinationDescription = '',
  destinationHighlights = [],
}: NotesTabContentProps) {
  const { toast } = useToast();
  const [personalNotes, setPersonalNotes] = useState<
    Array<{
      id: string;
      title: string;
      content: string;
      updatedAt?: string;
    }>
  >([]);
  const [isLoadingPersonalNotes, setIsLoadingPersonalNotes] = useState(false);

  // Use our centralized notes hook for API operations
  const { content, isLoading, isSaving, error, updateContent } = useNotes(tripId);

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

    // Load personal notes here from API
    // This is a placeholder for future implementation
    const loadPersonalNotes = async () => {
      setIsLoadingPersonalNotes(true);
      try {
        // API call would go here
        // For now, just simulate some notes
        setPersonalNotes([
          {
            id: '1',
            title: 'Trip Planning Notes',
            content:
              '# Trip Planning\n\nThings to consider:\n\n- Weather forecast\n- Local events\n- Transportation options',
            updatedAt: new Date().toISOString(),
          },
        ]);
      } catch (error) {
        console.error('Error loading personal notes:', error);
      } finally {
        setIsLoadingPersonalNotes(false);
      }
    };

    loadPersonalNotes();
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

      toast({
        title: 'Destination Info Added',
        description: `Added information about ${destinationName} to your trip notes.`,
      });
    } catch (error) {
      console.error('Error creating default note:', error);
      Sentry.captureException(error, {
        tags: { action: 'createDefaultNote', tripId },
      });

      toast({
        title: 'Error Adding Destination Info',
        description: 'Could not add destination information to your notes.',
        variant: 'destructive',
      });
    }
  };

  // During initial load, show skeleton
  if (isLoading && content === '') {
    return <Skeleton className="h-64 w-full" />;
  }

  // Handler for creating personal notes
  const handleCreatePersonalNote = async (title: string) => {
    // In a real implementation, this would call an API
    // For now, we'll just create a local note
    const newNote = {
      id: `note_${Date.now()}`,
      title,
      content: '',
      updatedAt: new Date().toISOString(),
    };

    setPersonalNotes([newNote, ...personalNotes]);
    return newNote;
  };

  // Handler for updating personal notes
  const handleUpdatePersonalNote = async (id: string, title: string, content: string) => {
    // In a real implementation, this would call an API
    setPersonalNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, title, content, updatedAt: new Date().toISOString() } : note
      )
    );
  };

  // Handler for deleting personal notes
  const handleDeletePersonalNote = async (id: string) => {
    // In a real implementation, this would call an API
    setPersonalNotes((prev) => prev.filter((note) => note.id !== id));
  };

  return (
    <div className="space-y-4">
      <NotesTabTemplate
        tripId={tripId}
        canEdit={canEdit}
        initialNotes={personalNotes}
        enableCollaboration={true}
        isLoading={isLoadingPersonalNotes}
        error={error}
        onCreateNote={handleCreatePersonalNote}
        onUpdateNote={handleUpdatePersonalNote}
        onDeleteNote={handleDeletePersonalNote}
      />

      {canEdit && destinationName && content.trim() === '' && (
        <div className="mt-4 p-4 bg-muted rounded-md">
          <h3 className="text-sm font-medium mb-2">Add Destination Information?</h3>
          <p className="text-sm text-muted-foreground mb-3">
            We can add information about {destinationName} to your notes to help you plan your trip.
          </p>
          <button
            className="text-sm text-primary hover:underline"
            onClick={addDefaultDestinationNote}
            disabled={isSaving}
          >
            {isSaving ? 'Adding...' : 'Add Destination Info'}
          </button>
        </div>
      )}
    </div>
  );
}
