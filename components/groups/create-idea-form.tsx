'use client';

import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GROUP_PLAN_IDEA_TYPE } from '@/utils/constants/status';
import { useToast } from '@/components/ui/use-toast';

// Form schema with Zod validation
const formSchema = z.object({
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title must be under 100 characters'),
  description: z.string().optional(),
  type: z.enum([
    GROUP_PLAN_IDEA_TYPE.DESTINATION,
    GROUP_PLAN_IDEA_TYPE.DATE,
    GROUP_PLAN_IDEA_TYPE.ACTIVITY,
    GROUP_PLAN_IDEA_TYPE.BUDGET,
    GROUP_PLAN_IDEA_TYPE.OTHER,
    GROUP_PLAN_IDEA_TYPE.QUESTION,
    GROUP_PLAN_IDEA_TYPE.NOTE,
    GROUP_PLAN_IDEA_TYPE.PLACE,
  ]),
});

type FormData = z.infer<typeof formSchema>;

interface CreateIdeaFormProps {
  groupId: string;
  planId: string;
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
}

export function CreateIdeaForm({ groupId, planId, onSuccess, onCancel }: CreateIdeaFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Initialize form with React Hook Form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      type: GROUP_PLAN_IDEA_TYPE.ACTIVITY,
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/groups/${groupId}/plans/${planId}/ideas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          type: data.type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create idea');
      }

      const result = await response.json();

      toast({
        title: 'Idea created',
        description: 'Your idea has been added to the plan',
      });

      // Reset form
      form.reset();

      // Call success callback with the created idea data
      if (onSuccess) {
        onSuccess(result.idea);
      }
    } catch (error) {
      console.error('Error creating idea:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create idea',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input placeholder="Enter the title of your idea" {...field} />
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
                placeholder="Describe your idea (optional)"
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select the type of idea" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value={GROUP_PLAN_IDEA_TYPE.ACTIVITY}>Activity</SelectItem>
                <SelectItem value={GROUP_PLAN_IDEA_TYPE.DESTINATION}>Destination</SelectItem>
                <SelectItem value={GROUP_PLAN_IDEA_TYPE.PLACE}>Place</SelectItem>
                <SelectItem value={GROUP_PLAN_IDEA_TYPE.DATE}>Date</SelectItem>
                <SelectItem value={GROUP_PLAN_IDEA_TYPE.BUDGET}>Budget</SelectItem>
                <SelectItem value={GROUP_PLAN_IDEA_TYPE.QUESTION}>Question</SelectItem>
                <SelectItem value={GROUP_PLAN_IDEA_TYPE.NOTE}>Note</SelectItem>
                <SelectItem value={GROUP_PLAN_IDEA_TYPE.OTHER}>Other</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex justify-end space-x-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Idea'
          )}
        </Button>
      </div>
    </form>
  );
}
