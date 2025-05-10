'use client';

import React, { useEffect, useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Pencil, Trash2 } from 'lucide-react';
import { API_ROUTES } from '@/utils/constants/routes';

interface TriggersTableProps {
  studyId: string;
  onEdit: (trigger: any) => void;
}

interface Trigger {
  id: string;
  study_id: string;
  trigger_event: string;
  survey_id: string;
  min_delay_ms: number;
  max_triggers: number;
  active: boolean;
  created_at: string;
  updated_at?: string;
}

export default function TriggersTable({ studyId, onEdit }: TriggersTableProps) {
  const { toast } = useToast();
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [surveys, setSurveys] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [triggerToDelete, setTriggerToDelete] = useState<string | null>(null);
  
  const loadTriggers = async (retryCount = 0, backoffMs = 1000) => {
    try {
      setIsLoading(true);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      // Fetch triggers
      const response = await fetch(`/api/admin/research/triggers?studyId=${studyId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Handle rate limiting (429 Too Many Requests)
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || '5';
        const retryMs = parseInt(retryAfter, 10) * 1000;
        
        toast({
          title: 'Too many requests',
          description: `Please wait ${Math.ceil(retryMs/1000)} seconds before trying again`,
          variant: 'default'
        });
        
        // Wait and retry with exponential backoff
        if (retryCount < 3) {
          console.log(`Rate limited. Retrying in ${retryMs}ms...`);
          setTimeout(() => loadTriggers(retryCount + 1, backoffMs * 2), retryMs);
        }
        
        setIsLoading(false);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to load triggers: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Handle both array response and object with triggers property for backward compatibility
      const triggerArray = Array.isArray(data) ? data : (data?.triggers || []);
      console.log(`Loaded ${triggerArray.length} triggers`);
      setTriggers(triggerArray);
      
      // Also load surveys for display
      const surveysResponse = await fetch('/api/admin/research/surveys', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (surveysResponse.ok) {
        const surveysData = await surveysResponse.json();
        setSurveys(surveysData || []);
      } else if (surveysResponse.status !== 429) { // Don't show error for rate limiting
        console.warn('Failed to load surveys:', surveysResponse.status);
      }
    } catch (error: unknown) {
      console.error('Error loading triggers:', error);
      
      // Retry on network errors with exponential backoff
      if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TypeError')) {
        if (retryCount < 3) {
          console.log(`Network error. Retrying in ${backoffMs}ms...`);
          setTimeout(() => loadTriggers(retryCount + 1, backoffMs * 2), backoffMs);
          return;
        }
      }
      
      toast({
        title: 'Error',
        description: 'Failed to load triggers. Please refresh and try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (studyId) {
      loadTriggers();
    }
  }, [studyId]);
  
  const handleToggleActive = async (trigger: Trigger) => {
    try {
      const response = await fetch(`/api/admin/research/triggers/${trigger.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !trigger.active })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update trigger');
      }
      
      // Update local state
      setTriggers(triggers.map(t => 
        t.id === trigger.id ? { ...t, active: !t.active } : t
      ));
      
      toast({
        title: 'Success',
        description: `Trigger ${!trigger.active ? 'activated' : 'deactivated'}`
      });
    } catch (error) {
      console.error('Error toggling trigger active state:', error);
      toast({
        title: 'Error',
        description: 'Failed to update trigger',
        variant: 'destructive'
      });
    }
  };
  
  const handleDelete = async () => {
    if (!triggerToDelete) return;
    
    try {
      const response = await fetch(`/api/admin/research/triggers/${triggerToDelete}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete trigger');
      }
      
      // Update local state
      setTriggers(triggers.filter(t => t.id !== triggerToDelete));
      
      toast({
        title: 'Success',
        description: 'Trigger deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting trigger:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete trigger',
        variant: 'destructive'
      });
    } finally {
      setTriggerToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };
  
  const confirmDelete = (triggerId: string) => {
    setTriggerToDelete(triggerId);
    setDeleteConfirmOpen(true);
  };
  
  // Helper function to get survey title
  const getSurveyTitle = (surveyId: string) => {
    if (!surveys || surveys.length === 0) return 'Unknown Survey';
    const survey = surveys.find(s => s?.id === surveyId || s?.survey_id === surveyId);
    return survey?.title || 'Unknown Survey';
  };
  
  // Format milliseconds to seconds
  const formatDelay = (ms: number) => {
    if (!ms) return '0 seconds';
    return `${ms / 1000} seconds`;
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        <span className="ml-2">Loading triggers...</span>
      </div>
    );
  }
  
  if (triggers.length === 0) {
    return (
      <div className="bg-card text-card-foreground border rounded-lg p-6 text-center">
        <p className="text-muted-foreground">No triggers found for this study.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Add a trigger to show surveys when users complete specific actions.
        </p>
      </div>
    );
  }
  
  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Survey</TableHead>
              <TableHead>Delay</TableHead>
              <TableHead>Max Triggers</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {triggers.map((trigger) => (
              <TableRow key={trigger.id}>
                <TableCell className="font-medium">{trigger.trigger_event || 'Unknown Event'}</TableCell>
                <TableCell>{getSurveyTitle(trigger.survey_id)}</TableCell>
                <TableCell>{formatDelay(trigger.min_delay_ms)}</TableCell>
                <TableCell>{trigger.max_triggers || 1}</TableCell>
                <TableCell>
                  <Switch
                    checked={trigger.active === true}
                    onCheckedChange={() => handleToggleActive(trigger)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(trigger)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => confirmDelete(trigger.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the trigger. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 