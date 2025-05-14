'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

// Form schema for adding milestone triggers
const formSchema = z.object({
  milestone_id: z.string().min(1, 'Please select a milestone'),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  is_required: z.boolean().default(false),
  show_survey_after: z.enum(['immediately', 'delay_24h', 'delay_1w']).default('immediately'),
});

type FormValues = z.infer<typeof formSchema>;

export default function SurveyMilestonesPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [survey, setSurvey] = useState<any | null>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [availableMilestones, setAvailableMilestones] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      milestone_id: '',
      priority: 'medium',
      is_required: false,
      show_survey_after: 'immediately',
    },
  });

  // Fetch survey and milestones
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch survey
      const surveyRes = await fetch(`/api/research/surveys/${params.id}`);
      if (!surveyRes.ok) throw new Error('Failed to fetch survey');
      const surveyData = await surveyRes.json();
      
      // Fetch survey milestone triggers
      const milestonesRes = await fetch(`/api/research/surveys/${params.id}/milestones`);
      if (!milestonesRes.ok) throw new Error('Failed to fetch survey milestones');
      const milestonesData = await milestonesRes.json();
      
      // Fetch available milestones
      const availableRes = await fetch('/api/research/milestones');
      if (!availableRes.ok) throw new Error('Failed to fetch available milestones');
      const availableData = await availableRes.json();
      
      setSurvey(surveyData.survey);
      setMilestones(milestonesData.milestones || []);
      
      // Filter out already assigned milestones
      const assignedIds = milestonesData.milestones.map((m: any) => m.milestone_id);
      setAvailableMilestones(
        availableData.milestones.filter((m: any) => !assignedIds.includes(m.id))
      );
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load survey and milestones',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.id]);

  // Add milestone trigger
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/research/surveys/${params.id}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add milestone trigger');
      }
      
      toast({
        title: 'Success',
        description: 'Milestone trigger added successfully',
      });
      
      // Refresh data
      fetchData();
      
      // Reset form
      form.reset({
        milestone_id: '',
        priority: 'medium',
        is_required: false,
        show_survey_after: 'immediately',
      });
    } catch (error) {
      console.error('Error adding milestone trigger:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add milestone trigger',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete milestone trigger
  const deleteMilestoneTrigger = async (triggerId: string) => {
    if (!confirm('Are you sure you want to delete this milestone trigger?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/research/surveys/${params.id}/milestones/${triggerId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete milestone trigger');
      }
      
      toast({
        title: 'Success',
        description: 'Milestone trigger deleted successfully',
      });
      
      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error deleting milestone trigger:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete milestone trigger',
        variant: 'destructive',
      });
    }
  };

  // Helper function to get milestone name
  const getMilestoneName = (milestoneId: string) => {
    const milestone = availableMilestones.find(m => m.id === milestoneId);
    return milestone ? milestone.name : 'Unknown Milestone';
  };

  return (
    <div className="p-8">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Survey Milestone Triggers</h1>
          {survey && (
            <p className="text-muted-foreground">{survey.name || survey.title || 'Untitled Survey'}</p>
          )}
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="w-full h-64" />
      ) : (
        <>
          {/* Add Milestone Trigger Card */}
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
                    name="milestone_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Milestone</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={availableMilestones.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a milestone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableMilestones.length === 0 ? (
                              <SelectItem value="none" disabled>
                                No available milestones
                              </SelectItem>
                            ) : (
                              availableMilestones.map((milestone) => (
                                <SelectItem key={milestone.id} value={milestone.id}>
                                  {milestone.name}
                                </SelectItem>
                              ))
                            )}
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
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
                    name="show_survey_after"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Show Survey</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="When to show survey" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="immediately">Immediately</SelectItem>
                            <SelectItem value="delay_24h">After 24 hours</SelectItem>
                            <SelectItem value="delay_1w">After 1 week</SelectItem>
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
                      <FormItem className="flex flex-row items-center justify-between space-x-2 rounded-md border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Required Survey</FormLabel>
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

                  <Button type="submit" disabled={isSubmitting || availableMilestones.length === 0}>
                    {isSubmitting ? 'Adding...' : 'Add Milestone Trigger'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Milestone Triggers List Card */}
          <Card>
            <CardHeader>
              <CardTitle>Milestone Triggers</CardTitle>
              <CardDescription>
                Events that will trigger this survey to be shown
              </CardDescription>
            </CardHeader>
            <CardContent>
              {milestones.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No milestone triggers configured</p>
                  <Button
                    variant="outline"
                    onClick={() => form.handleSubmit(onSubmit)()}
                    disabled={availableMilestones.length === 0}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add your first milestone trigger
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Milestone</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Show After</TableHead>
                      <TableHead>Required</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {milestones.map((trigger) => (
                      <TableRow key={trigger.id}>
                        <TableCell>
                          {trigger.milestone?.name || 'Unknown Milestone'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            trigger.priority === 'high' ? 'destructive' : 
                            trigger.priority === 'medium' ? 'default' : 
                            'secondary'
                          }>
                            {trigger.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {trigger.show_survey_after === 'immediately' 
                            ? 'Immediately' 
                            : trigger.show_survey_after === 'delay_24h'
                            ? 'After 24 hours'
                            : 'After 1 week'
                          }
                        </TableCell>
                        <TableCell>
                          {trigger.is_required ? 'Yes' : 'No'}
                        </TableCell>
                        <TableCell>
                          {new Date(trigger.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => deleteMilestoneTrigger(trigger.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
} 