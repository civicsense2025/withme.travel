'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { AlertCircle, Edit, PlusCircle, RefreshCw, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { EventType } from '@/types/research';

// Form schema for milestone trigger
const formSchema = z.object({
  event_type: z.string().min(1, 'Event type is required'),
  form_id: z.string().uuid('Invalid form ID'),
  active: z.boolean().default(true),
  priority: z.coerce.number().int().min(0).max(100),
  filter_key: z.string().optional(),
  filter_value: z.string().optional(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Define the available event types (should be from a central location)
const eventTypeOptions: { label: string; value: EventType }[] = [
  { label: 'Trip Created', value: 'trip_created' },
  { label: 'Trip Updated', value: 'trip_updated' },
  { label: 'Trip Deleted', value: 'trip_deleted' },
  { label: 'Itinerary Item Added', value: 'itinerary_item_added' },
  { label: 'Itinerary Item Updated', value: 'itinerary_item_updated' },
  { label: 'Itinerary Item Deleted', value: 'itinerary_item_deleted' },
  { label: 'Group Created', value: 'group_created' },
  { label: 'Group Member Added', value: 'group_member_added' },
  { label: 'Group Member Removed', value: 'group_member_removed' },
  { label: 'Group Plan Created', value: 'group_plan_created' },
  { label: 'Comment Posted', value: 'comment_posted' },
  { label: 'Comment Reacted', value: 'comment_reacted' },
  { label: 'Budget Item Added', value: 'budget_item_added' },
  { label: 'Template Used', value: 'template_used' },
  { label: 'Survey Started', value: 'survey_started' },
  { label: 'Survey Completed', value: 'survey_completed' },
  { label: 'Survey Step Completed', value: 'survey_step_completed' },
  { label: 'Feedback Submitted', value: 'feedback_submitted' },
];

export default function MilestoneTriggerPage() {
  const router = useRouter();
  const [triggers, setTriggers] = useState<any[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [triggerToDelete, setTriggerToDelete] = useState<any | null>(null);

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      event_type: '',
      form_id: '',
      active: true,
      priority: 10,
      filter_key: '',
      filter_value: '',
      description: '',
    },
  });

  // Fetch triggers and forms
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch triggers
      const triggersRes = await fetch('/api/research/milestone-triggers');
      if (!triggersRes.ok) throw new Error('Failed to fetch triggers');
      const triggersData = await triggersRes.json();
      
      // Fetch forms
      const formsRes = await fetch('/api/research/forms');
      if (!formsRes.ok) throw new Error('Failed to fetch forms');
      const formsData = await formsRes.json();
      
      setTriggers(triggersData.triggers || []);
      setForms(formsData.forms || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load milestone triggers and forms',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle form open
  const handleOpenForm = (trigger: any = null) => {
    if (trigger) {
      // Edit mode
      setEditingTrigger(trigger);
      form.reset({
        event_type: trigger.event_type,
        form_id: trigger.form_id,
        active: trigger.active,
        priority: trigger.priority || 10,
        filter_key: trigger.filter_key || '',
        filter_value: trigger.filter_value || '',
        description: trigger.description || '',
      });
    } else {
      // Create mode
      setEditingTrigger(null);
      form.reset({
        event_type: '',
        form_id: '',
        active: true,
        priority: 10,
        filter_key: '',
        filter_value: '',
        description: '',
      });
    }
    setOpenDialog(true);
  };

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      let response;
      
      if (editingTrigger) {
        // Update existing trigger
        response = await fetch(`/api/research/milestone-triggers/${editingTrigger.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
      } else {
        // Create new trigger
        response = await fetch('/api/research/milestone-triggers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save trigger');
      }

      toast({
        title: 'Success',
        description: editingTrigger 
          ? 'Milestone trigger updated successfully' 
          : 'Milestone trigger created successfully',
      });

      setOpenDialog(false);
      fetchData(); // Refresh the list
    } catch (error) {
      console.error('Error saving trigger:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save trigger',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle trigger deletion
  const handleDelete = async () => {
    if (!triggerToDelete) return;
    
    try {
      const response = await fetch(`/api/research/milestone-triggers/${triggerToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete trigger');
      }

      toast({
        title: 'Success',
        description: 'Milestone trigger deleted successfully',
      });

      setDeleteDialogOpen(false);
      setTriggerToDelete(null);
      fetchData(); // Refresh the list
    } catch (error) {
      console.error('Error deleting trigger:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete trigger',
        variant: 'destructive',
      });
    }
  };

  // Get event type label
  const getEventTypeLabel = (eventType: string) => {
    const option = eventTypeOptions.find(opt => opt.value === eventType);
    return option ? option.label : eventType;
  };

  // Get form title
  const getFormTitle = (formId: string) => {
    const form = forms.find(f => f.id === formId);
    return form ? form.title : 'Unknown Form';
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Milestone Triggers</h1>
          <p className="text-muted-foreground">
            Manage triggers that display surveys based on user actions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            className="h-8 gap-1"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
          <Button
            size="sm"
            onClick={() => handleOpenForm()}
            className="h-8 gap-1"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Add Trigger</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Milestone Triggers</CardTitle>
          <CardDescription>
            These triggers display forms or surveys when specific events occur in the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : triggers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No milestone triggers found</p>
              <Button
                variant="outline"
                onClick={() => handleOpenForm()}
                className="mt-4"
              >
                Create your first trigger
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Form</TableHead>
                  <TableHead>Filter</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {triggers.map((trigger) => (
                  <TableRow key={trigger.id}>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {trigger.event_type}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {getEventTypeLabel(trigger.event_type)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {trigger.form?.title || getFormTitle(trigger.form_id)}
                      {trigger.form?.is_active === false && (
                        <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800">
                          Inactive Form
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {trigger.filter_key ? (
                        <div className="text-xs">
                          <span className="font-medium">{trigger.filter_key}:</span> {trigger.filter_value}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No filter</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={trigger.priority > 50 ? "secondary" : "outline"}>
                        {trigger.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={trigger.active ? "success" : "destructive"}>
                        {trigger.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenForm(trigger)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setTriggerToDelete(trigger);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingTrigger ? 'Edit Milestone Trigger' : 'Create Milestone Trigger'}
            </DialogTitle>
            <DialogDescription>
              Configure when and which form to display based on user actions
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Event Type */}
              <FormField
                control={form.control}
                name="event_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an event type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {eventTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The user action that will trigger the form
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Form ID */}
              <FormField
                control={form.control}
                name="form_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Form</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a form" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {forms.map((form) => (
                          <SelectItem key={form.id} value={form.id}>
                            {form.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The form to display when the event occurs
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Priority */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority (0-100)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Higher priority triggers are shown first when multiple triggers match
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Filter Key & Value */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="filter_key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Filter Key (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormDescription>
                        Property to check in event data
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="filter_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Filter Value (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormDescription>
                        Value to match in the property
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormDescription>
                      Notes about the purpose of this trigger
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Active Status */}
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <FormDescription>
                        Inactive triggers won't display forms
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenDialog(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingTrigger ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this milestone trigger? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 