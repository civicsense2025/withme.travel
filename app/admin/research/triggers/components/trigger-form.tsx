'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

interface TriggerFormProps {
  studyId: string;
  trigger?: any; // Existing trigger for editing (optional)
  onClose: () => void;
}

// Form schema with validation
const triggerSchema = z.object({
  trigger_event: z.string({
    required_error: 'Event name is required'
  }),
  survey_id: z.string({
    required_error: 'Survey is required'
  }),
  min_delay_ms: z.coerce.number()
    .min(0, 'Delay must be a positive number')
    .default(2000),
  max_triggers: z.coerce.number()
    .min(1, 'Maximum triggers must be at least 1')
    .default(1),
  active: z.boolean().default(true)
});

type TriggerFormValues = z.infer<typeof triggerSchema>;

export default function TriggerForm({ studyId, trigger, onClose }: TriggerFormProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [surveys, setSurveys] = useState<any[]>([]);
  const [eventOptions, setEventOptions] = useState<string[]>([]);
  
  // Initialize form
  const form = useForm<TriggerFormValues>({
    resolver: zodResolver(triggerSchema),
    defaultValues: {
      trigger_event: trigger?.trigger_event || '',
      survey_id: trigger?.survey_id || '',
      min_delay_ms: trigger?.min_delay_ms || 2000,
      max_triggers: trigger?.max_triggers || 1,
      active: trigger?.active !== undefined ? trigger.active : true
    }
  });
  
  // Load surveys and event options
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load surveys
        const surveysResponse = await fetch('/api/admin/research/surveys', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (surveysResponse.ok) {
          const surveysData = await surveysResponse.json();
          setSurveys(surveysData || []);
        }
        
        // Load event options
        const eventsResponse = await fetch(`/api/admin/research/events?study_id=${studyId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          setEventOptions(eventsData || []);
        }
      } catch (error) {
        console.error('Error loading form data:', error);
      }
    };
    
    loadData();
  }, [studyId]);
  
  const onSubmit = async (values: TriggerFormValues) => {
    try {
      setIsLoading(true);
      
      // Determine if creating or updating
      const isEditing = !!trigger;
      
      // For new triggers, ensure study_id is included
      const payload = {
        ...values,
        study_id: studyId
      };
      
      // Use correct URL and method based on operation
      const url = isEditing 
        ? `/api/admin/research/triggers/${trigger.id}`
        : '/api/admin/research/triggers';
      
      const method = isEditing ? 'PATCH' : 'POST';
      
      console.log(`Submitting trigger: ${JSON.stringify(payload)}`);
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        // Get detailed error message if available
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || `HTTP error ${response.status}`;
        } catch (e) {
          errorMessage = `HTTP error ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }
      
      const responseData = await response.json();
      
      toast({
        title: 'Success',
        description: `Trigger ${isEditing ? 'updated' : 'created'} successfully`,
        variant: 'default'
      });
      
      handleClose();
      
      // Force reload after a short delay to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error(`Error ${trigger ? 'updating' : 'creating'} trigger:`, error);
      toast({
        title: 'Error',
        description: error instanceof Error 
          ? error.message 
          : `Failed to ${trigger ? 'update' : 'create'} trigger`,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) handleClose();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{trigger ? 'Edit Trigger' : 'Add Trigger'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            {/* Event selection */}
            <FormField
              control={form.control}
              name="trigger_event"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an event" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {eventOptions.map((eventName) => (
                        <SelectItem key={eventName} value={eventName}>
                          {eventName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    When will this survey be shown to the user?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Survey selection */}
            <FormField
              control={form.control}
              name="survey_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Survey</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a survey" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {surveys.map((survey) => (
                        <SelectItem 
                          key={survey.id || survey.survey_id} 
                          value={survey.id || survey.survey_id}
                        >
                          {survey.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Which survey will be displayed?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Delay input */}
            <FormField
              control={form.control}
              name="min_delay_ms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delay (milliseconds)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="2000"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    How long to wait after the event before showing the survey
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Max triggers input */}
            <FormField
              control={form.control}
              name="max_triggers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Triggers</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="1"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum number of times to show this survey per participant
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Active toggle */}
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      Is this trigger active and should be shown to users?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="mr-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    </span>
                    Processing...
                  </>
                ) : trigger ? (
                  'Update'
                ) : (
                  'Create'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 