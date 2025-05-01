'use client'
import { API_ROUTES } from '@/utils/constants/routes';


import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Loader2, X } from 'lucide-react';
import { TripNotesEditor } from './trip-notes-editor';
import { useToast } from '@/hooks/use-toast';
import { formatError } from '@/lib/utils';
import { TagInput } from '@/components/ui/tag-input';
import { type Tag } from '@/types/tag';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';

// Define types for the note list and selected note
interface NoteListItem {
  id: string;
  title: string;
  // Maybe add updated_at if needed for display
}

interface Note extends NoteListItem {
  content: string;
}

type CollaborativeNotesProps = {
  tripId: string;
  readOnly?: boolean;
};

export function CollaborativeNotes({ tripId, readOnly = false }: CollaborativeNotesProps) {
  const [notesList, setNotesList] = useState<NoteListItem[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [currentNoteTags, setCurrentNoteTags] = useState<Tag[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingNote, setIsLoadingNote] = useState(false);
  const [isSavingTags, setIsSavingTags] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const supabase = createClient();
  const { toast } = useToast();
  const saveTagsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch notes list on component mount
  useEffect(() => {
    async function fetchNotesList() {
      setIsLoadingList(true);
      try {
        const response = await fetch(API_ROUTES.COLLABORATIVE_NOTES(tripId));
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to fetch notes list');
        }
        const data = await response.json();
        setNotesList(data.notes || []);

        // If we have notes and none is selected, select the first one
        if (data.notes && data.notes.length > 0 && !selectedNoteId) {
          setSelectedNoteId(data.notes[0].id);
        }
      } catch (err) {
        console.error('Error fetching notes list:', err);
        setError(formatError(err, 'Failed to load notes list'));
      } finally {
        setIsLoadingList(false);
      }
    }
    fetchNotesList();
  }, [tripId, selectedNoteId]);

  // Fetch selected note content AND tags when ID changes
  useEffect(() => {
    async function fetchNoteDetails() {
      if (!selectedNoteId) {
        setSelectedNote(null);
        setCurrentNoteTags([]);
        return;
      }
      try {
        setIsLoadingNote(true);
        setError(null);
        setSelectedNote(null);
        setCurrentNoteTags([]);

        // Fetch both content and tags in parallel
        const noteContentPromise = fetch(
          `${API_ROUTES.COLLABORATIVE_NOTES(tripId)}/${selectedNoteId}`
        );
        const noteTagsPromise = fetch(
          `${API_ROUTES.COLLABORATIVE_NOTES(tripId)}/${selectedNoteId}/tags`
        );

        const [contentResponse, tagsResponse] = await Promise.all([
          noteContentPromise,
          noteTagsPromise,
        ]);

        // Handle content response
        if (!contentResponse.ok) {
          if (contentResponse.status === 404) {
            toast({
              title: 'Note not found',
              description: 'Maybe it was deleted? Refreshing list...',
              variant: 'destructive',
            });
            // TODO: Implement list refresh
            setSelectedNoteId(null);
            return;
          }
          const errData = await contentResponse.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to fetch note content');
        }
        const contentData = await contentResponse.json();
        setSelectedNote(contentData.note);

        // Handle tags response (non-critical, don't fail if tags fetch fails)
        if (tagsResponse.ok) {
          const tagsData = await tagsResponse.json();
          // Ensure fetched tags conform to the Tag type { id, name }
          const fetchedTags: Tag[] = (tagsData.tags || []).map((tag: any) => ({
            id: tag.id,
            name: tag.name,
          }));
          setCurrentNoteTags(fetchedTags);
        } else {
          console.error('Failed to fetch tags for note:', selectedNoteId, tagsResponse.status);
          setCurrentNoteTags([]);
          // Optionally show a non-blocking toast message for tag fetch failure
        }
      } catch (err) {
        console.error('Error fetching note details:', err);
        setError(formatError(err, 'Failed to load note details'));
        setSelectedNote(null);
        setCurrentNoteTags([]);
      } finally {
        setIsLoadingNote(false);
      }
    }
    fetchNoteDetails();
  }, [selectedNoteId, tripId, toast]);

  const handleCreateNote = async () => {
    if (!newNoteTitle.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for your new note.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoadingNote(true); // Use note loading state for creation action
    try {
      const response = await fetch(API_ROUTES.COLLABORATIVE_NOTES(tripId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newNoteTitle.trim(), content: '' }), // Start with empty content
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to create note');
      }
      const data = await response.json();
      const newNote = data.note;
      // Add to list and select it
      setNotesList([newNote, ...notesList]);
      setSelectedNoteId(newNote.id);
      setNewNoteTitle('');
      setIsCreating(false);
      toast({ title: 'Note Created!', description: `"${newNote.title}" added.` });
    } catch (err) {
      console.error('Error creating note:', err);
      toast({
        title: 'Error Creating Note',
        description: formatError(err),
        variant: 'destructive',
      });
    } finally {
      setIsLoadingNote(false);
    }
  };

  const confirmDeleteNote = async (noteIdToDelete: string) => {
    if (!noteIdToDelete) return;

    setIsLoadingNote(true);

    try {
      const response = await fetch(`${API_ROUTES.COLLABORATIVE_NOTES(tripId)}/${noteIdToDelete}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to delete note (status ${response.status})`);
      }

      const updatedNotesList = notesList.filter((note) => note.id !== noteIdToDelete);
      setNotesList(updatedNotesList);

      if (selectedNoteId === noteIdToDelete) {
        const nextNoteId = updatedNotesList.length > 0 ? updatedNotesList[0].id : null;
        setSelectedNoteId(nextNoteId);
        setSelectedNote(null);
        setCurrentNoteTags([]);
      }
      toast({ title: 'Note Deleted' });
    } catch (err) {
      console.error('Error deleting note:', err);
      toast({
        title: 'Error Deleting Note',
        description: formatError(err),
        variant: 'destructive',
      });
    } finally {
      setIsLoadingNote(false);
    }
  };

  // Handler for tag changes
  const handleTagsChange = (newTagNames: string[]) => {
    if (readOnly || !selectedNoteId) return; // Prevent changes if readOnly or no note selected

    // Clear any existing save timer
    if (saveTagsTimeoutRef.current) {
      clearTimeout(saveTagsTimeoutRef.current);
    }

    // Convert string array back to Tag array for state update (might lose IDs for new tags temporarily)
    // We'll rely on the save function to get the final IDs from the backend.
    const newTags: Tag[] = newTagNames.map((name) => {
      // Try to find existing tag to preserve ID
      const existing = currentNoteTags.find((t) => t.name.toLowerCase() === name.toLowerCase());
      return existing || { id: `temp-${name}`, name: name }; // Use temp ID for new ones
    });

    const oldTags = currentNoteTags;
    setCurrentNoteTags(newTags);

    // Set a timer to save after 1 second (1000ms) of inactivity
    saveTagsTimeoutRef.current = setTimeout(() => {
      saveTags(newTagNames, oldTags); // Pass the names array to save function
    }, 1000);
  };

  // Ensure timeout is cleared on component unmount or when selected note changes
  useEffect(() => {
    return () => {
      if (saveTagsTimeoutRef.current) {
        clearTimeout(saveTagsTimeoutRef.current);
      }
    };
  }, [selectedNoteId]);

  // Function to save tags via API
  const saveTags = async (tagNamesToSave: string[], previousTags: Tag[]) => {
    if (!selectedNoteId) return;
    setIsSavingTags(true);
    console.log('Saving tags:', tagNamesToSave); // Debug log
    try {
      const response = await fetch(
        `${API_ROUTES.COLLABORATIVE_NOTES(tripId)}/${selectedNoteId}/tags`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tags: tagNamesToSave }), // Send array of names
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save tags');
      }

      const data = await response.json();
      // Update state with the final tags (including potentially new IDs) from the API
      const finalTags: Tag[] = (data.tags || []).map((tag: any) => ({
        id: tag.id,
        name: tag.name,
      }));
      setCurrentNoteTags(finalTags);
    } catch (err) {
      console.error('Error saving tags:', err);
      toast({ title: 'Error Saving Tags', description: formatError(err), variant: 'destructive' });
      setCurrentNoteTags(previousTags); // Revert on error
    } finally {
      setIsSavingTags(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
      {/* Notes List Column */}
      <div className="md:col-span-1 space-y-4">
        <Card className="overflow-hidden">
          <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Notes</CardTitle>
            {!readOnly && (
              <div>
                {isCreating ? (
                  <div className="flex items-center gap-1">
                    <Input
                      placeholder="New title..."
                      value={newNoteTitle}
                      onChange={(e) => setNewNoteTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateNote()}
                      autoFocus
                      className="h-8 w-32"
                    />
                    <Button
                      onClick={handleCreateNote}
                      size="icon"
                      variant="ghost"
                      disabled={isLoadingNote || !newNoteTitle.trim()}
                      className="h-8 w-8"
                    >
                      {isLoadingNote ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      <span className="sr-only">Create Note</span>
                    </Button>
                    <Button
                      onClick={() => setIsCreating(false)}
                      size="icon"
                      variant="ghost"
                      disabled={isLoadingNote}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Cancel</span>
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsCreating(true)}
                    className="gap-1"
                  >
                    <Plus className="h-4 w-4" /> Add
                  </Button>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {/* Notes List */}
            {isLoadingList ? (
              <div className="space-y-2 p-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-6 w-2/3" />
              </div>
            ) : error ? (
              <div className="p-4 text-center text-destructive">{error}</div>
            ) : notesList.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground italic">
                {readOnly ? 'No notes yet.' : 'Create your first note!'}
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-20rem)]">
                <div className="divide-y divide-border">
                  {notesList.map((note) => (
                    <div
                      key={note.id}
                      className="flex items-center justify-between w-full text-left px-4 py-2 group"
                    >
                      <button
                        onClick={() => setSelectedNoteId(note.id)}
                        disabled={isLoadingNote}
                        className={`flex-1 truncate pr-2 text-sm hover:text-primary transition-colors disabled:opacity-50 ${
                          selectedNoteId === note.id ? 'font-semibold text-primary' : ''
                        }`}
                      >
                        {note.title}
                      </button>
                      {!readOnly && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                              aria-label="Delete note"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the note
                                "<strong>{note.title}</strong>".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmDeleteNote(note.id);
                                }}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Note Editor Column */}
      <div className="md:col-span-2">
        {isLoadingNote && selectedNoteId ? (
          <Card className="min-h-[400px]">
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ) : selectedNote ? (
          <Card className="overflow-hidden">
            <CardHeader className="p-4 border-b">
              {/* Note Title (Could be editable) */}
              <CardTitle className="text-lg font-semibold">{selectedNote.title}</CardTitle>
              {/* Add placeholder for author/updated_at if available */}
              {/* <p className="text-xs text-muted-foreground">Last updated X ago by Y</p> */}
            </CardHeader>
            <CardContent className="p-4">
              {/* Tag Input */}
              {!readOnly && (
                <div className="mb-4">
                  <Label className="mb-2 block text-sm font-medium">Tags</Label>
                  <TagInput
                    value={currentNoteTags.map((tag) => tag.name)}
                    onChange={handleTagsChange}
                    placeholder="Add relevant tags..."
                  />
                  {isSavingTags && (
                    <p className="text-xs text-muted-foreground mt-1 animate-pulse">
                      Saving tags...
                    </p>
                  )}
                </div>
              )}
              {/* Editor */}
              <TripNotesEditor
                noteId={selectedNote.id}
                initialContent={selectedNote.content}
                tripId={tripId}
                readOnly={readOnly}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="flex items-center justify-center h-[400px] border rounded-lg bg-muted/20">
            <p className="text-muted-foreground italic">
              {notesList.length > 0
                ? 'Select a note to view/edit'
                : readOnly
                  ? 'No notes to display'
                  : 'Create a note to get started'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
