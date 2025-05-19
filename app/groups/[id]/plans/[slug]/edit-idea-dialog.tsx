'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/lib/hooks/use-toast'
import { Loader2 } from 'lucide-react';
import { GroupIdea, ColumnId } from './store/idea-store';
import { DatePicker } from '@/components/ui/date-picker';

interface DateRange {
  from: Date | null;
  to: Date | null;
}

interface EditIdeaDialogProps {
  groupId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idea: GroupIdea | null;
  onIdeaUpdated: (idea: GroupIdea) => void;
  planSlug: string;
}

export default function EditIdeaDialog({
  groupId,
  open,
  onOpenChange,
  idea,
  onIdeaUpdated,
  planSlug,
}: EditIdeaDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ColumnId>('destination');
  const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null });
  const [notes, setNotes] = useState('');

  // Initialize form when idea changes
  useEffect(() => {
    if (idea) {
      setTitle(idea.title || '');
      setDescription(idea.description || '');
      setType(idea.type as ColumnId);
      setNotes(idea.notes || '');

      // Set date range if available
      if (idea.start_date || idea.end_date) {
        setDateRange({
          from: idea.start_date ? new Date(idea.start_date) : null,
          to: idea.end_date ? new Date(idea.end_date) : null,
        });
      } else {
        setDateRange({ from: null, to: null });
      }
    }
  }, [idea]);

  const handleUpdate = async () => {
    if (!idea) return;

    if (!title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please provide a title for your idea',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/groups/${groupId}/plans/${planSlug}/ideas/${idea.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description: description || null,
          type,
          start_date: dateRange.from ? dateRange.from.toISOString() : null,
          end_date: dateRange.to ? dateRange.to.toISOString() : null,
          notes: notes || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update idea');
      }

      const { idea: updatedIdea } = await response.json();

      toast({
        title: 'Success',
        description: 'Idea updated successfully',
      });

      // Call the callback with the updated idea
      onIdeaUpdated(updatedIdea);

      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating idea:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update idea',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Idea</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="edit-idea-type" className="text-right text-sm font-medium">
              Type
            </label>
            <Select value={type} onValueChange={(value) => setType(value as ColumnId)}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="destination">Destination</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="activity">Activity</SelectItem>
                <SelectItem value="budget">Budget</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="edit-idea-title" className="text-right text-sm font-medium">
              Title
            </label>
            <Input
              id="edit-idea-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="Enter idea title"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="edit-idea-description" className="text-right text-sm font-medium">
              Description
            </label>
            <Textarea
              id="edit-idea-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Enter a description (optional)"
              rows={3}
            />
          </div>

          {type === 'date' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-date-range" className="text-right text-sm font-medium">
                Date Range
              </label>
              <div className="col-span-3">
                <DatePicker
                  date={dateRange}
                  setDate={setDateRange}
                  placeholder="Select date range"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="edit-idea-notes" className="text-right text-sm font-medium">
              Notes
            </label>
            <Textarea
              id="edit-idea-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="col-span-3"
              placeholder="Add any additional notes (optional)"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={isLoading || !title.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Idea'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
