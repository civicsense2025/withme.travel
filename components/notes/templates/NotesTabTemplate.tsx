/**
 * Notes Tab Template
 *
 * Template component that structures the Notes tab for trips
 *
 * @module notes/templates
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Loader2 } from 'lucide-react';
import { CollaborativeEditor } from '../molecules/CollaborativeEditor';
import { NoteCard } from '../molecules/NoteCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt?: string;
}

export interface NotesTabTemplateProps {
  /** ID of the trip */
  tripId: string;
  /** Whether user can edit notes */
  canEdit?: boolean;
  /** Optional initial notes list */
  initialNotes?: Note[];
  /** Whether to load full collaborative system */
  enableCollaboration?: boolean;
  /** Whether notes are currently loading */
  isLoading?: boolean;
  /** Error message if any */
  error?: string | null;
  /** Callback when a note is created */
  onCreateNote?: (title: string) => Promise<Note>;
  /** Callback when a note is updated */
  onUpdateNote?: (id: string, title: string, content: string) => Promise<void>;
  /** Callback when a note is deleted */
  onDeleteNote?: (id: string) => Promise<void>;
  /** Optional additional CSS classes */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function NotesTabTemplate({
  tripId,
  canEdit = false,
  initialNotes = [],
  enableCollaboration = true,
  isLoading = false,
  error = null,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
  className,
}: NotesTabTemplateProps) {
  const [activeTab, setActiveTab] = useState<string>('collaborative');
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [isCreating, setIsCreating] = useState(false);

  // Handle creating a new note
  const handleCreateNote = async () => {
    if (!onCreateNote || isCreating) return;

    setIsCreating(true);
    try {
      const title = `Note ${notes.length + 1}`;
      const newNote = await onCreateNote(title);
      setNotes([newNote, ...notes]);
    } catch (error) {
      console.error('Failed to create note:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle updating a note
  const handleUpdateNote = async (id: string, title: string, content: string) => {
    if (!onUpdateNote) return;

    try {
      await onUpdateNote(id, title, content);
      // Update local state
      setNotes(
        notes.map((note) =>
          note.id === id ? { ...note, title, content, updatedAt: new Date().toISOString() } : note
        )
      );
    } catch (error) {
      console.error('Failed to update note:', error);
      throw error;
    }
  };

  // Handle deleting a note
  const handleDeleteNote = async (id: string) => {
    if (!onDeleteNote) return;

    try {
      await onDeleteNote(id);
      // Update local state
      setNotes(notes.filter((note) => note.id !== id));
    } catch (error) {
      console.error('Failed to delete note:', error);
      throw error;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <Tabs defaultValue="collaborative" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="collaborative">Collaborative Note</TabsTrigger>
            <TabsTrigger value="personal">Personal Notes</TabsTrigger>
          </TabsList>

          {activeTab === 'personal' && canEdit && (
            <Button size="sm" onClick={handleCreateNote} disabled={isCreating} className="gap-1">
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Add Note
            </Button>
          )}
        </div>

        <TabsContent value="collaborative" className="mt-0">
          {enableCollaboration && <CollaborativeEditor tripId={tripId} readOnly={!canEdit} />}
        </TabsContent>

        <TabsContent value="personal" className="mt-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No notes yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create personal notes to keep track of your ideas and plans for this trip.
              </p>
              {canEdit && (
                <Button onClick={handleCreateNote} disabled={isCreating}>
                  {isCreating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Create Your First Note
                </Button>
              )}
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {notes.map((note) => (
                  <NoteCard
                    key={note.id}
                    id={note.id}
                    title={note.title}
                    content={note.content}
                    updatedAt={note.updatedAt}
                    editable={canEdit}
                    onUpdate={handleUpdateNote}
                    onDelete={handleDeleteNote}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md mt-4">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
