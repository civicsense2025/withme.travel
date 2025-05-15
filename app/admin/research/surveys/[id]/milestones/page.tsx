'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
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
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Plus } from 'lucide-react';
import { MILESTONE_EVENT_TYPES } from '@/utils/constants/status';
import { MilestoneEventDisplay } from '@/components/research/MilestoneEventDisplay';

// Zod schema for milestone trigger form
const milestoneFormSchema = z.object({
  milestone: z.string().min(1, "Milestone is required"),
  priority: z.enum(["low", "medium", "high"]),
  trigger_delay: z.enum(["immediately", "delayed"]),
  is_required: z.boolean().default(false),
});

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const triggerDelayOptions = [
  { value: 'immediately', label: 'Immediately' },
  { value: 'delayed', label: 'After delay (5 seconds)' },
];

export default function MilestoneTriggerPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [survey, setSurvey] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  const form = useForm<z.infer<typeof milestoneFormSchema>>({
    resolver: zodResolver(milestoneFormSchema),
    defaultValues: {
      milestone: '',
      priority: 'medium',
      trigger_delay: 'immediately',
      is_required: false,
    },
  });

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch survey details
        const surveyResponse = await fetch(`/api/research/surveys/${params.id}`);
        if (!surveyResponse.ok) {
          throw new Error('Failed to fetch survey');
        }
        
        const surveyData = await surveyResponse.json();
        setSurvey(surveyData.survey);
        
        // Fetch milestone triggers
        try {
          const milestonesResponse = await fetch(`/api/research/surveys/${params.id}/milestones`);
          if (milestonesResponse.ok) {
            const milestonesData = await milestonesResponse.json();
            setMilestones(milestonesData.milestones || []);
          }
        } catch (error) {
          console.error('Error fetching milestones:', error);
        }
        
        // Fetch events (simplified for demo)
        try {
          const eventsResponse = await fetch(`/api/research/events?limit=10`);
          if (eventsResponse.ok) {
            const eventsData = await eventsResponse.json();
            setEvents(eventsData.events || []);
          }
        } catch (error) {
          console.error('Error fetching events:', error);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load survey details',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [params.id]);

  const onSubmit = async (values: z.infer<typeof milestoneFormSchema>) => {
    try {
      // Add milestone trigger
      const response = await fetch(`/api/research/surveys/${params.id}/milestones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create milestone trigger');
      }
      
      const data = await response.json();
      
      // Update local milestones list
      setMilestones(prev => [...prev, data.milestone]);
      setShowAddForm(false);
      form.reset();
      
      toast({
        title: 'Success',
        description: 'Milestone trigger created successfully',
      });
    } catch (error) {
      console.error('Error creating milestone trigger:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create milestone trigger',
        variant: 'destructive',
      });
    }
  };
  
  const milestoneOptions = Object.entries(MILESTONE_EVENT_TYPES).map(([key, value]) => ({
    label: key.split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' '),
    value
  }));

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center mb-6">
          <Skeleton className="h-10 w-32 mr-4" />
          <div className="flex-1">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/admin/research/surveys/${params.id}`)}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Survey
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Survey Milestone Triggers</h1>
          <p className="text-muted-foreground">
            {survey?.name || 'Untitled Survey'}
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Milestone Trigger
        </Button>
      </div>

      {/* Add Milestone Trigger Form */}
      {showAddForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add Milestone Trigger</CardTitle>
            <CardDescription>
              Configure when to show this survey based on user actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="milestone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Milestone</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a milestone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {milestoneOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the user action that should trigger this survey
                      </FormDescription>
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
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {priorityOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Higher priority surveys will be shown first if multiple are triggered
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="trigger_delay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Show Survey</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select when to show" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {triggerDelayOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        When to show the survey after the milestone is reached
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_required"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Required Survey</FormLabel>
                        <FormDescription>
                          Make this survey required to complete when triggered
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Add Milestone Trigger</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Existing Triggers */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Configured Triggers</CardTitle>
          <CardDescription>
            Existing milestone triggers for this survey
          </CardDescription>
        </CardHeader>
        <CardContent>
          {milestones.length > 0 ? (
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium">{milestone.milestone_type}</h3>
                      <p className="text-sm text-muted-foreground">
                        Priority: {milestone.priority} • 
                        Show: {milestone.trigger_delay} •
                        Required: {milestone.is_required ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <Button variant="destructive" size="sm">Remove</Button>
                  </div>
                  
                  {/* Show related events using the MilestoneEventDisplay component */}
                  <div className="mt-4">
                    <MilestoneEventDisplay 
                      milestone={milestone.milestone_type}
                      events={events.filter(e => e.milestone === milestone.milestone_type)}
                      className="mt-2"
                    />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No milestone triggers configured yet</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Trigger
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 