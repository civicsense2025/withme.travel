/**
 * TaskForm component for creating and editing tasks
 */

'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaskItem, TaskPriority, ExtendedItemStatus, ProfileBasic } from './types';

// ============================================================================
// PROPS DEFINITION
// ============================================================================

export interface TaskFormProps {
  /** Initial task data when editing */
  initialTask?: Partial<TaskItem>;
  /** Available users for assignment */
  availableUsers?: ProfileBasic[];
  /** Submit handler for the form */
  onSubmit: (taskData: TaskFormValues) => void;
  /** Cancel handler */
  onCancel?: () => void;
  /** Is the form currently submitting */
  isSubmitting?: boolean;
  /** Form mode */
  mode?: 'create' | 'edit';
  /** Additional CSS class names */
  className?: string;
}

// ============================================================================
// FORM SCHEMA
// ============================================================================

// Define validation schema
const taskFormSchema = z.object({
  title: z.string()
    .min(3, { message: 'Title must be at least 3 characters' })
    .max(100, { message: 'Title must be less than 100 characters' }),
  description: z.string().optional(),
  status: z.enum(['suggested', 'confirmed', 'rejected', 'active', 'cancelled'] as const),
  dueDate: z.date().optional().nullable(),
  priority: z.enum(['high', 'medium', 'low'] as const).optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

// Status options for the form
const statusOptions: { value: ExtendedItemStatus; label: string }[] = [
  { value: 'suggested', label: 'Suggested' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'active', label: 'Active' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
];

// Priority options for the form
const priorityOptions: { value: TaskPriority; label: string }[] = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Form for creating or editing a task
 */
export function TaskForm({
  initialTask,
  availableUsers = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = 'create',
  className = '',
}: TaskFormProps) {
  // Form setup with validation
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: initialTask?.title || '',
      description: initialTask?.description || '',
      status: (initialTask?.status as ExtendedItemStatus) || 'suggested',
      dueDate: initialTask?.dueDate ? new Date(initialTask.dueDate) : null,
      priority: initialTask?.priority || null,
      assigneeId: initialTask?.assignee?.id || null,
      tags: initialTask?.tags || [],
    },
  });

  // Simple tag input state
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initialTask?.tags || []);

  // Update form data when initialTask changes
  useEffect(() => {
    if (initialTask) {
      form.reset({
        title: initialTask.title || '',
        description: initialTask.description || '',
        status: (initialTask.status as ExtendedItemStatus) || 'suggested',
        dueDate: initialTask.dueDate ? new Date(initialTask.dueDate) : null,
        priority: initialTask.priority || null,
        assigneeId: initialTask.assignee?.id || null,
        tags: initialTask.tags || [],
      });
      
      setTags(initialTask.tags || []);
    }
  }, [initialTask, form]);

  // Handle form submission
  const handleSubmit = (values: TaskFormValues) => {
    // Add the tags to the values
    const dataWithTags = { ...values, tags };
    onSubmit(dataWithTags);
  };

  // Add a tag to the list
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      form.setValue('tags', newTags);
      setTagInput('');
    }
  };

  // Remove a tag from the list
  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    form.setValue('tags', newTags);
  };

  // Handle tag input key press
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Form form={form}>
      <form 
        onSubmit={form.handleSubmit(handleSubmit)} 
        className={`space-y-6 ${className}`}
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter task title" 
                  {...field} 
                  autoFocus
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter task details" 
                  {...field} 
                  rows={3}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                Optional detailed information about the task
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {priorityOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={(date) => field.onChange(date)}
                      disabled={(date) => date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Optional deadline for the task
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assigneeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assignee</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Assign to" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {availableUsers.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name || user.username || user.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Person responsible for this task
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormLabel>Tags</FormLabel>
          <div className="flex gap-2 mt-1.5 mb-2">
            <Input
              placeholder="Add tags (press Enter)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyPress}
              className="flex-1"
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={addTag}
            >
              Add
            </Button>
          </div>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map(tag => (
                <div 
                  key={tag} 
                  className="bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full text-sm flex items-center"
                >
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 ml-1 rounded-full"
                    onClick={() => removeTag(tag)}
                  >
                    &times;
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Task' : 'Update Task'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 