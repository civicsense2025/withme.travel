'use client';

import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast'

const pollSchema = z.object({
  title: z.string().min(3, {
    message: 'Title must be at least 3 characters.',
  }),
  description: z.string().optional(),
  options: z
    .array(
      z.object({
        title: z.string().min(1, { message: 'Option title is required' }),
        description: z.string().optional(),
      })
    )
    .min(2, { message: 'At least 2 options are required' }),
  expiresAt: z.date().optional(),
});

type PollFormValues = z.infer<typeof pollSchema>;

interface CreatePollFormProps {
  tripId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreatePollForm({ tripId, onSuccess, onCancel }: CreatePollFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PollFormValues>({
    resolver: zodResolver(pollSchema),
    defaultValues: {
      title: '',
      description: '',
      options: [
        { title: '', description: '' },
        { title: '', description: '' },
      ],
    },
  });

  const handleAddOption = () => {
    const currentOptions = form.getValues('options');
    form.setValue('options', [...currentOptions, { title: '', description: '' }]);
  };

  const handleRemoveOption = (index: number) => {
    const currentOptions = form.getValues('options');
    if (currentOptions.length <= 2) {
      toast({
        description: 'At least 2 options are required',
        variant: 'destructive',
      });
      return;
    }

    form.setValue(
      'options',
      currentOptions.filter((_, i) => i !== index)
    );
  };

  const onSubmit = async (values: PollFormValues) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/trips/${tripId}/vote/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create poll');
      }

      toast({
        description: 'Poll created successfully',
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating poll:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to create the poll. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form form={form} {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Poll Question</FormLabel>
              <FormControl>
                <Input placeholder="What should we do on Friday?" {...field} />
              </FormControl>
              <FormDescription>Create a clear question for your group to vote on</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Add more details about this poll" rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <FormLabel>Options</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddOption}
              className="h-8"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Option
            </Button>
          </div>

          {form.getValues('options').map((_, index) => (
            <div key={index} className="flex gap-3 items-start">
              <div className="flex-1 space-y-2">
                <FormField
                  control={form.control}
                  name={`options.${index}.title`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder={`Option ${index + 1}`} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`options.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Optional description"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mt-2"
                onClick={() => handleRemoveOption(index)}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>

        <FormField
          control={form.control}
          name="expiresAt"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Expiry Date (optional)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Set a deadline for the poll. If no date is set, the poll will remain active
                indefinitely.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Poll'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
