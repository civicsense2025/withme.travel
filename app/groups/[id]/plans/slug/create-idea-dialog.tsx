'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Loader2, PlusCircle } from 'lucide-react';
import { GroupIdea, ColumnId } from '../../../ideas/store/idea-store';
import { DatePicker } from '@/components/ui/date-picker';

interface DateRange {
  from: Date | null;
  to: Date | null;
}

interface CreateIdeaDialogProps {
  groupId: string;
  planId: string;
  onIdeaCreated: (idea: GroupIdea) => void;
}

export default function CreateIdeaDialog({ 
  groupId, 
  planId,
  onIdeaCreated
}: CreateIdeaDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ColumnId>('destination');
  const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null });
  const [notes, setNotes] = useState('');
  
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setType('destination');
    setDateRange({ from: null, to: null });
    setNotes('');
  };
  
  const handleCreate = async () => {
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
      const response = await fetch(`/api/groups/${groupId}/ideas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description: description || null,
          type,
          plan_id: planId,
          start_date: dateRange.from ? dateRange.from.toISOString() : null,
          end_date: dateRange.to ? dateRange.to.toISOString() : null,
          notes: notes || null,
          position: { columnId: type, index: 0 },
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create idea');
      }
      
      const { idea } = await response.json();
      
      toast({
        title: 'Success',
        description: 'Idea created successfully',
      });
      
      // Call the callback with the new idea
      onIdeaCreated(idea);
      
      // Close dialog and reset form
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating idea:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create idea',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusCircle className="h-4 w-4 mr-2" />
        Add Idea
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Idea</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="idea-type" className="text-right text-sm font-medium">
                Type
              </label>
              <Select 
                value={type} 
                onValueChange={(value: ColumnId) => setType(value)}
              >
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
              <label htmlFor="idea-title" className="text-right text-sm font-medium">
                Title
              </label>
              <Input
                id="idea-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
                placeholder="Enter idea title"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="idea-description" className="text-right text-sm font-medium">
                Description
              </label>
              <Textarea
                id="idea-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                placeholder="Enter a description (optional)"
                rows={3}
              />
            </div>
            
            {type === 'date' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="date-range" className="text-right text-sm font-medium">
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
              <label htmlFor="idea-notes" className="text-right text-sm font-medium">
                Notes
              </label>
              <Textarea
                id="idea-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="col-span-3"
                placeholder="Add any additional notes (optional)"
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isLoading || !title.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Idea'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 