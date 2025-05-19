/**
 * Note Card
 *
 * Molecule component that combines NoteTitle and NoteContent into a card
 *
 * @module notes/molecules
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Trash, Save, X, Clock } from 'lucide-react';
import { NoteTitle } from '../atoms/NoteTitle';
import { NoteContent } from '../atoms/NoteContent';
import { NoteEditor } from '../atoms/NoteEditor';
import { formatDistanceToNow } from 'date-fns';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface NoteCardProps {
  /** Unique ID for the note */
  id: string;
  /** Note title */
  title: string;
  /** Note content in Markdown format */
  content: string;
  /** ISO date string of when the note was last updated */
  updatedAt?: string;
  /** Whether the note card is editable */
  editable?: boolean;
  /** Callback when note is updated */
  onUpdate?: (id: string, title: string, content: string) => void;
  /** Callback when note is deleted */
  onDelete?: (id: string) => void;
  /** Optional additional CSS classes */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function NoteCard({
  id,
  title,
  content,
  updatedAt,
  editable = false,
  onUpdate,
  onDelete,
  className,
}: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableTitle, setEditableTitle] = useState(title);
  const [editableContent, setEditableContent] = useState(content);
  const [isSaving, setIsSaving] = useState(false);

  // Handle saving changes
  const handleSave = async () => {
    if (!onUpdate) return;

    setIsSaving(true);
    try {
      await onUpdate(id, editableTitle, editableContent);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle deleting the note
  const handleDelete = async () => {
    if (!onDelete) return;

    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await onDelete(id);
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  };

  // Handle canceling edits
  const handleCancel = () => {
    setEditableTitle(title);
    setEditableContent(content);
    setIsEditing(false);
  };

  // Format the last updated date
  const formattedDate = updatedAt
    ? formatDistanceToNow(new Date(updatedAt), { addSuffix: true })
    : '';

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="p-4 pb-2">
        {isEditing ? (
          <NoteTitle
            title={editableTitle}
            editable={true}
            onChange={setEditableTitle}
            className="mb-0"
          />
        ) : (
          <NoteTitle
            title={title}
            editable={editable}
            onChange={(newTitle) => {
              setEditableTitle(newTitle);
              setIsEditing(true);
            }}
            className="mb-0"
          />
        )}

        {updatedAt && !isEditing && (
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <Clock className="h-3 w-3 mr-1" />
            <span>Updated {formattedDate}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4 pt-2">
        {isEditing ? (
          <NoteEditor
            value={editableContent}
            onChange={setEditableContent}
            minHeight="200px"
            onAutoSave={() => {}}
          />
        ) : (
          <NoteContent content={content} />
        )}
      </CardContent>

      {editable && (
        <CardFooter className="p-4 pt-0 flex justify-end gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSaving}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <span className="animate-spin mr-1">
                      <Clock className="h-4 w-4" />
                    </span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
