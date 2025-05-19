/**
 * GroupIdeaForm Component
 * 
 * Reusable form component for creating and editing group ideas with validation
 * and customizable submission handling.
 * 
 * @module components/groups
 */

'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth-provider';
import { format } from 'date-fns';
import type { IdeaFormInput, IdeaType } from '@/types/group-ideas';

// ============================================================================
// COMPONENT PROPS
// ============================================================================

interface GroupIdeaFormProps {
  /** Initial form data for editing mode */
  initialData?: Partial<IdeaFormInput> & {
    id?: string;
    link?: string | null;
    notes?: string | null;
    start_date?: string | null;
    end_date?: string | null;
  };
  /** Function called on successful form submission */
  onSubmit: (formData: any) => Promise<void>;
  /** Whether the form is currently submitting */
  isSubmitting?: boolean;
  /** Whether to show form in a compact layout */
  compact?: boolean;
  /** Form layout: 'dialog' for modal window, 'inline' for embedded form */
  layout?: 'dialog' | 'inline';
  /** Function to call when user cancels form entry */
  onCancel?: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const IDEA_TYPES: { value: IdeaType; label: string; icon: string }[] = [
  { value: 'place', label: 'Place to visit', icon: '🏙️' },
  { value: 'activity', label: 'Activity', icon: '🏄‍♂️' },
  { value: 'note', label: 'Note', icon: '📝' },
  { value: 'question', label: 'Question', icon: '❓' },
  { value: 'other', label: 'Other', icon: '💭' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Form component for creating and editing group ideas
 */
export function GroupIdeaForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  compact = false,
  layout = 'inline',
  onCancel,
}: GroupIdeaFormProps) {
  // ============================================================================
  // STATE AND HOOKS
  // ============================================================================
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [ideaType, setIdeaType] = useState<IdeaType | ''>(initialData?.type || '');
  const [link, setLink] = useState(initialData?.link || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialData?.start_date ? new Date(initialData.start_date) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialData?.end_date ? new Date(initialData.end_date) : undefined
  );
  
  const [errors, setErrors] = useState<{
    title?: string;
    type?: string;
    link?: string;
  }>({});
  
  const { toast } = useToast();
  const { user } = useAuth();
  const isGuest = !user;

  // ============================================================================
  // FORM VALIDATION
  // ============================================================================
  const validateForm = (): boolean => {
    const newErrors: {
      title?: string;
      type?: string;
      link?: string;
    } = {};

    // Title validation
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    // Type validation
    if (!ideaType) {
      newErrors.type = 'Please select an idea type';
    }

    // Link validation - simple URL check if provided
    if (link.trim()) {
      try {
        new URL(link);
      } catch {
        newErrors.link = 'Please enter a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Create idea data object
    const formData: any = {
      title: title.trim(),
      description: description.trim() || undefined,
      type: ideaType,
      link: link.trim() || null,
      notes: notes.trim() || null,
    };

    // Add date range if provided
    if (startDate) {
      formData.start_date = startDate.toISOString();
    }
    
    if (endDate) {
      formData.end_date = endDate.toISOString();
    }

    // If editing, include the id
    if (initialData?.id) {
      formData.id = initialData.id;
    }

    await onSubmit(formData);
  };

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================
  
  // Get icon for selected idea type
  const getIdeaTypeIcon = (type: string): string => {
    return IDEA_TYPES.find(t => t.value === type)?.icon || '💭';
  };

  // Get label for the form based on mode
  const getFormLabel = (): string => {
    return initialData?.id ? 'Edit Idea' : 'Add New Idea';
  };

  // Check if date inputs should be shown
  const showDates = () => {
    // If the idea is a note, question, or activity, we can include dates
    return ideaType === 'activity' || ideaType === 'place';
  };

  // Render form content
  const renderFormContent = () => (
    <form onSubmit={handleSubmit} className={cn("space-y-4", compact && "space-y-3")}>
      {/* Title input */}
      <div className={cn("grid gap-2", compact ? "grid-cols-1" : "grid-cols-4 items-center")}>
        <Label htmlFor="title" className={cn(compact ? "" : "text-right")}>
          Title
        </Label>
        <div className={cn(compact ? "" : "col-span-3")}>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My awesome idea"
            required
            className={errors.title ? "border-destructive" : ""}
          />
          {errors.title && (
            <p className="text-xs text-destructive mt-1">{errors.title}</p>
          )}
        </div>
      </div>
      
      {/* Type selector */}
      <div className={cn("grid gap-2", compact ? "grid-cols-1" : "grid-cols-4 items-center")}>
        <Label htmlFor="type" className={cn(compact ? "" : "text-right")}>
          Type
        </Label>
        <div className={cn(compact ? "" : "col-span-3")}>
          <Select value={ideaType} onValueChange={(value) => setIdeaType(value as IdeaType)}>
            <SelectTrigger id="type" className={errors.type ? "border-destructive" : ""}>
              <SelectValue placeholder="Select idea type">
                {ideaType && (
                  <span>
                    {getIdeaTypeIcon(ideaType)}&nbsp;
                    {IDEA_TYPES.find(t => t.value === ideaType)?.label || ideaType}
                  </span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Idea Types</SelectLabel>
                {IDEA_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <span className="flex items-center">
                      <span className="mr-2">{type.icon}</span>
                      {type.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="text-xs text-destructive mt-1">{errors.type}</p>
          )}
        </div>
      </div>
      
      {/* Description textarea */}
      <div className={cn("grid gap-2", compact ? "grid-cols-1" : "grid-cols-4 items-start")}>
        <Label htmlFor="description" className={cn(compact ? "" : "text-right", "mt-2")}>
          Description
        </Label>
        <div className={cn(compact ? "" : "col-span-3")}>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell us more about your idea"
            className="min-h-[80px]"
          />
        </div>
      </div>
      
      {/* Date inputs (shown only for activity or place ideas) */}
      {showDates() && (
        <>
          {/* Start Date */}
          <div className={cn("grid gap-2", compact ? "grid-cols-1" : "grid-cols-4 items-center")}>
            <Label htmlFor="start-date" className={cn(compact ? "" : "text-right")}>
              Start Date
            </Label>
            <div className={cn(compact ? "" : "col-span-3")}>
              <Popover>
                <PopoverTrigger>
                  <Button
                    id="start-date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Select start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {/* End Date */}
          <div className={cn("grid gap-2", compact ? "grid-cols-1" : "grid-cols-4 items-center")}>
            <Label htmlFor="end-date" className={cn(compact ? "" : "text-right")}>
              End Date
            </Label>
            <div className={cn(compact ? "" : "col-span-3")}>
              <Popover>
                <PopoverTrigger>
                  <Button
                    id="end-date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Select end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </>
      )}
      
      {/* Link input */}
      <div className={cn("grid gap-2", compact ? "grid-cols-1" : "grid-cols-4 items-center")}>
        <Label htmlFor="link" className={cn(compact ? "" : "text-right")}>
          Link
        </Label>
        <div className={cn(compact ? "" : "col-span-3")}>
          <div className="flex items-center">
            <Input
              id="link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://example.com"
              type="url"
              className={cn(errors.link ? "border-destructive" : "", "flex-1")}
            />
          </div>
          {errors.link && (
            <p className="text-xs text-destructive mt-1">{errors.link}</p>
          )}
        </div>
      </div>
      
      {/* Notes textarea */}
      <div className={cn("grid gap-2", compact ? "grid-cols-1" : "grid-cols-4 items-start")}>
        <Label htmlFor="notes" className={cn(compact ? "" : "text-right", "mt-2")}>
          Notes
        </Label>
        <div className={cn(compact ? "" : "col-span-3")}>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes (optional)"
          />
        </div>
      </div>
      
      {/* Guest message */}
      {isGuest && (
        <div className="col-span-full pt-2 px-2 text-sm text-muted-foreground">
          <p>
            You're adding this idea as a guest.{' '}
            <a href="/signup" className="text-primary underline">
              Sign up
            </a>{' '}
            to create an account and manage all your ideas.
          </p>
        </div>
      )}
      
      {/* Form buttons */}
      <div className={cn("flex justify-end gap-2", compact && "mt-2")}>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData?.id ? 'Update Idea' : 'Create Idea'}
        </Button>
      </div>
    </form>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  // For inline layout, return the form directly
  if (layout === 'inline') {
    return (
      <Card>
        <CardContent className="pt-4">
          <h3 className="text-lg font-medium mb-4">{getFormLabel()}</h3>
          {renderFormContent()}
        </CardContent>
      </Card>
    );
  }
  
  // For dialog layout, the parent component should handle the Dialog wrapper
  return renderFormContent();
}

// Default export for backward compatibility
export default GroupIdeaForm; 