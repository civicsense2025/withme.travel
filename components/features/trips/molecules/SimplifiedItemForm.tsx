/**
 * @deprecated This component has been moved to components/features/trips/molecules/SimplifiedItemForm.tsx
 * Please update your imports to use the new location.
 */
'use client';

import React, { useState, useRef } from 'react';
import { PlusCircle, Send, X } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

// UI Components
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useToast } from '@/lib/hooks/use-toast';

// Form schema validation for simplified add item
const simpleAddItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  item_type: z.enum(['activity', 'accommodation', 'transportation', 'food'], {
    errorMap: () => ({ message: 'Please select a valid type' }),
  }),
});

type SimpleAddFormValues = z.infer<typeof simpleAddItemSchema>;

interface SimplifiedItemFormProps {
  tripId: string;
  section?: string | null;
  dayNumber?: number | null;
  onItemAdded?: () => void;
}

export function SimplifiedItemForm({
  tripId,
  section = null,
  dayNumber = null,
  onItemAdded,
}: SimplifiedItemFormProps) {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SimpleAddFormValues>({
    resolver: zodResolver(simpleAddItemSchema),
    defaultValues: {
      name: '',
      item_type: undefined,
    },
  });

  const resetForm = () => {
    reset({
      name: '',
      item_type: undefined,
    });
    setIsExpanded(false);
  };

  const onSubmit = async (data: SimpleAddFormValues) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/trips/${tripId}/itinerary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'item',
          name: data.name,
          item_type: data.item_type,
          section_id: section,
          day_number: dayNumber,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add item');
      }

      toast({
        title: 'Item Added',
        description: `Added "${data.name}" to your itinerary`,
      });

      resetForm();
      if (onItemAdded) onItemAdded();
    } catch (error) {
      console.error('Failed to add item:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add item',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isExpanded) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="w-full flex items-center justify-center gap-1 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md py-2"
        onClick={() => setIsExpanded(true)}
      >
        <PlusCircle className="h-4 w-4" />
        <span>Add Item</span>
      </Button>
    );
  }

  return (
    <Card className="p-3 border border-dashed">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <div className="flex gap-2">
          <Input
            {...register('name')}
            placeholder="What are you planning?"
            className={`flex-grow ${errors.name ? 'border-red-500' : ''}`}
            disabled={isSubmitting}
            autoFocus
          />

          <div>
            <label
              htmlFor="item-type"
              className="block text-sm font-medium text-muted-foreground mb-1"
            >
              Item Type
            </label>
            <Select
              onValueChange={(value) => setValue('item_type', value as any)}
              disabled={isSubmitting}
            >
              <SelectTrigger
                className={`w-36 ${errors.item_type ? 'border-red-500' : ''}`}
                id="item-type"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activity">Activity</SelectItem>
                <SelectItem value="accommodation">Accommodation</SelectItem>
                <SelectItem value="transportation">Transportation</SelectItem>
                <SelectItem value="food">Food</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resetForm}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>

          <Button type="submit" size="sm" disabled={isSubmitting}>
            <Send className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </form>
    </Card>
  );
}

// Also create a version for bulk adding multiple items at once
export function BulkItemForm({
  tripId,
  section = null,
  dayNumber = null,
  onItemAdded,
}: SimplifiedItemFormProps) {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [itemType, setItemType] = useState<string>('activity'); // Default to 'activity'
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const resetForm = () => {
    setBulkText('');
    setItemType('activity'); // Reset to default
    setIsExpanded(false);
    setIsFocused(false);
  };

  // Comprehensive event handlers for focus and drag prevention
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  // Universal event handler to stop propagation for all events
  const stopPropagation = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  // Special handler for keydown to handle Enter key properly
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Always stop propagation first to prevent drag activation
    e.stopPropagation();

    // Let the Enter key create new lines without submitting the form
    if (e.key === 'Enter') {
      // Prevent form submission on Enter (we'll handle it with the submit button)
      e.preventDefault();

      // Insert a newline manually
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;

      // Insert a newline at the cursor position
      const newValue = value.substring(0, start) + '\n' + value.substring(end);

      // Update the state
      setBulkText(newValue);

      // Set cursor position after the inserted newline (needs to be done after render)
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 1;
          textareaRef.current.selectionEnd = start + 1;
        }
      }, 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!bulkText.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide text for your items',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Split by new lines
      const items = bulkText
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (items.length === 0) {
        throw new Error('No valid items found');
      }

      // Create all items in sequence
      let addedCount = 0;
      let failedCount = 0;

      for (const itemText of items) {
        try {
          const response = await fetch(`/api/trips/${tripId}/itinerary`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'item',
              name: itemText,
              title: itemText, // Include both name and title to avoid ambiguity
              item_type: itemType,
              section_id: section,
              day_number: dayNumber,
            }),
          });

          if (response.ok) {
            addedCount++;
          } else {
            failedCount++;
            console.error(`Failed to add item "${itemText}": ${await response.text()}`);
          }
        } catch (error) {
          failedCount++;
          console.error(`Error adding item "${itemText}":`, error);
        }
      }

      // Show appropriate message based on success/failure
      if (addedCount > 0) {
        toast({
          title: 'Items Added',
          description: `Added ${addedCount} ${addedCount === 1 ? 'item' : 'items'} to your itinerary${failedCount > 0 ? ` (${failedCount} failed)` : ''}`,
        });

        resetForm();
        if (onItemAdded) onItemAdded();
      } else {
        throw new Error('Failed to add any items');
      }
    } catch (error) {
      console.error('Failed to add bulk items:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add items',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isExpanded) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="w-full flex items-center justify-center gap-1 text-muted-foreground"
        onClick={() => setIsExpanded(true)}
      >
        <PlusCircle className="h-4 w-4" />
        <span>Add Multiple Items</span>
      </Button>
    );
  }

  return (
    <Card className="p-3 border border-dashed">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="space-y-2"
        onClick={stopPropagation}
        onMouseDown={stopPropagation}
        onMouseMove={stopPropagation}
      >
        {/* Item Type Selection - Added at the top */}
        <div className="mb-3">
          <label
            htmlFor="multi-item-type"
            className="block text-sm font-medium text-foreground mb-1"
          >
            Item Type{' '}
            <span className="text-muted-foreground font-normal">(applied to all items)</span>
          </label>
          <Select
            value={itemType}
            onValueChange={(value) => setItemType(value)}
            disabled={isSubmitting}
          >
            <SelectTrigger className="w-full" id="multi-item-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="activity">Activity</SelectItem>
              <SelectItem value="accommodation">Accommodation</SelectItem>
              <SelectItem value="transportation">Transportation</SelectItem>
              <SelectItem value="food">Food</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            All items will be added as <span className="font-medium">{itemType}</span> type
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div
            className="relative drag-disabled"
            onClick={stopPropagation}
            onMouseDown={stopPropagation}
            onMouseMove={stopPropagation}
            onDragStart={stopPropagation}
            onDrag={stopPropagation}
          >
            <textarea
              ref={textareaRef}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              onMouseDown={stopPropagation}
              onMouseMove={stopPropagation}
              onDragStart={stopPropagation}
              onDrag={stopPropagation}
              onClick={stopPropagation}
              placeholder="Add multiple items, one per line:&#10;Visit Museum&#10;Dinner at Restaurant&#10;City Tour"
              className="w-full h-24 p-2 border rounded-md resize-none drag-disabled"
              disabled={isSubmitting}
              autoFocus
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              resetForm();
            }}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>

          <Button type="submit" size="sm" disabled={isSubmitting || !bulkText.trim()}>
            <Send className="h-4 w-4 mr-1" />
            Add All
          </Button>
        </div>
      </form>
    </Card>
  );
}
