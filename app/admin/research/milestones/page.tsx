'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getBrowserClient } from '@/utils/supabase/browser-client';
import { MilestoneType } from '@/types/research';
import { ArrowLeft, PlusCircle, Filter, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';

// Human-readable milestone names
const MILESTONE_LABELS: Record<MilestoneType, string> = {
  [MilestoneType.COMPLETE_ONBOARDING]: 'Complete Onboarding',
  [MilestoneType.ITINERARY_MILESTONE_3_ITEMS]: 'Add 3+ Itinerary Items',
  [MilestoneType.GROUP_FORMATION_COMPLETE]: 'Create a Group',
  [MilestoneType.VOTE_PROCESS_USED]: 'Use Voting Feature',
  [MilestoneType.TRIP_FROM_TEMPLATE_CREATED]: 'Create Trip from Template'
};

// Interface for milestone trigger with survey data
interface MilestoneTriggerWithSurvey {
  id: string;
  study_id: string;
  milestone_type: MilestoneType;
  threshold_value: number | null;
  is_active: boolean;
  survey_id: string;
  created_at: string;
  updated_at: string;
  survey?: {
    id: string;
    title: string;
  };
}

export default function MilestonesPage() {
  const searchParams = useSearchParams();
  const studyId = searchParams ? searchParams.get('studyId') : null;
  const { toast } = useToast();
  const supabase = getBrowserClient();
  
  const [selectedStudyId, setSelectedStudyId] = useState<string | null>(studyId);
  const [studies, setStudies] = useState<any[]>([]);
  const [milestoneTriggers, setMilestoneTriggers] = useState<MilestoneTriggerWithSurvey[]>([]);
  const [surveys, setSurveys] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newTrigger, setNewTrigger] = useState({
    milestone_type: MilestoneType.COMPLETE_ONBOARDING,
    threshold_value: '',
    is_active: true,
    survey_id: ''
  });
  
  // Load available studies
  useEffect(() => {
    const loadStudies = async () => {
      try {
        const { data: studiesData, error } = await supabase
          .from('research_studies')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setStudies(studiesData || []);
        
        // If studyId was passed in URL and exists in the list, set it as selected
        if (studyId) {
          const study = studiesData?.find((s: any) => s.id === studyId);
          if (study) {
            setSelectedStudyId(studyId);
          }
        }
      } catch (error) {
        console.error('Error loading studies:', error);
        toast({
          title: 'Error',
          description: 'Failed to load research studies.',
          variant: 'destructive',
        });
      }
    };
    
    loadStudies();
  }, [supabase, studyId, toast]);
  
  // Load available surveys for selection
  useEffect(() => {
    const loadSurveys = async () => {
      try {
        const { data: surveysData, error } = await supabase
          .from('survey_definitions')
          .select('survey_id, title, is_active')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setSurveys(surveysData || []);
      } catch (error) {
        console.error('Error loading surveys:', error);
        toast({
          title: 'Error',
          description: 'Failed to load survey definitions.',
          variant: 'destructive',
        });
      }
    };
    
    loadSurveys();
  }, [supabase, toast]);
  
  // Load milestone triggers for selected study
  useEffect(() => {
    if (!selectedStudyId) {
      setIsLoading(false);
      return;
    }
    
    const loadMilestoneTriggers = async () => {
      setIsLoading(true);
      
      try {
        const { data: triggers, error } = await supabase
          .from('milestone_triggers')
          .select(`
            *,
            survey_definitions:survey_id (
              title
            )
          `)
          .eq('study_id', selectedStudyId);
          
        if (error) throw error;
        
        // Transform the data to match our interface
        const formattedTriggers: MilestoneTriggerWithSurvey[] = triggers.map((trigger: any) => ({
          ...trigger,
          survey: {
            id: trigger.survey_id,
            title: trigger.survey_definitions?.title || 'Unknown Survey'
          }
        }));
        
        setMilestoneTriggers(formattedTriggers);
      } catch (error) {
        console.error('Error loading milestone triggers:', error);
        toast({
          title: 'Error',
          description: 'Failed to load milestone triggers.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMilestoneTriggers();
  }, [selectedStudyId, supabase, toast]);
  
  // Create a new milestone trigger
  const createMilestoneTrigger = async () => {
    if (!selectedStudyId || !newTrigger.survey_id) {
      toast({
        title: 'Missing Fields',
        description: 'Please select a study and survey before creating a trigger.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsCreating(true);
    
    try {
      const { data, error } = await supabase
        .from('milestone_triggers')
        .insert({
          study_id: selectedStudyId,
          milestone_type: newTrigger.milestone_type,
          threshold_value: newTrigger.threshold_value ? parseInt(newTrigger.threshold_value) : null,
          is_active: newTrigger.is_active,
          survey_id: newTrigger.survey_id
        })
        .select(`
          *,
          survey_definitions:survey_id (
            title
          )
        `)
        .single();
        
      if (error) throw error;
      
      // Format the new trigger to match our interface
      const formattedTrigger: MilestoneTriggerWithSurvey = {
        ...data,
        survey: {
          id: data.survey_id,
          title: data.survey_definitions?.title || 'Unknown Survey'
        }
      };
      
      // Add new trigger to the list
      setMilestoneTriggers(prev => [...prev, formattedTrigger]);
      
      // Reset form
      setNewTrigger({
        milestone_type: MilestoneType.COMPLETE_ONBOARDING,
        threshold_value: '',
        is_active: true,
        survey_id: ''
      });
      
      // Close create form
      setIsCreating(false);
      
      toast({
        title: 'Success',
        description: 'Milestone trigger created successfully.',
      });
    } catch (error) {
      console.error('Error creating milestone trigger:', error);
      toast({
        title: 'Error',
        description: 'Failed to create milestone trigger.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };
  
  // Toggle trigger active state
  const toggleTriggerActive = async (triggerId: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('milestone_triggers')
        .update({ is_active: !currentState })
        .eq('id', triggerId);
        
      if (error) throw error;
      
      // Update local state
      setMilestoneTriggers(prev => 
        prev.map(trigger => 
          trigger.id === triggerId 
            ? { ...trigger, is_active: !currentState } 
            : trigger
        )
      );
      
      toast({
        title: 'Success',
        description: `Milestone trigger ${currentState ? 'disabled' : 'enabled'}.`,
      });
    } catch (error) {
      console.error('Error toggling trigger state:', error);
      toast({
        title: 'Error',
        description: 'Failed to update trigger state.',
        variant: 'destructive',
      });
    }
  };
  
  // Delete a trigger
  const deleteTrigger = async (triggerId: string) => {
    if (!confirm('Are you sure you want to delete this milestone trigger?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('milestone_triggers')
        .delete()
        .eq('id', triggerId);
        
      if (error) throw error;
      
      // Remove from local state
      setMilestoneTriggers(prev => prev.filter(trigger => trigger.id !== triggerId));
      
      toast({
        title: 'Success',
        description: 'Milestone trigger deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting milestone trigger:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete milestone trigger.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/admin/research">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Milestone Triggers</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={selectedStudyId || ''} onValueChange={setSelectedStudyId}>
            <SelectTrigger className="w-[250px]">
              <SelectValue>
                {selectedStudyId ? studies.find(s => s.id === selectedStudyId)?.name : 'Select a study'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {studies.map(study => (
                <SelectItem key={study.id} value={study.id}>
                  {study.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedStudyId && (
            <Button 
              variant="outline" 
              onClick={() => setIsCreating(!isCreating)}
              className="flex items-center gap-1"
            >
              {isCreating ? 'Cancel' : (
                <>
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add Trigger
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      
      {!selectedStudyId ? (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-muted-foreground">Please select a study to manage milestone triggers</p>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-muted-foreground">Loading milestone triggers...</p>
        </div>
      ) : (
        <>
          {isCreating && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Create New Milestone Trigger</CardTitle>
                <CardDescription>
                  Configure when to show surveys based on milestone achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <Label>Milestone Type</Label>
                      <Select 
                        value={newTrigger.milestone_type} 
                        onValueChange={(value) => setNewTrigger(prev => ({ ...prev, milestone_type: value as MilestoneType }))}
                      >
                        <SelectTrigger>
                          <SelectValue>
                            {MILESTONE_LABELS[newTrigger.milestone_type as MilestoneType]}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(MilestoneType).map(type => (
                            <SelectItem key={type} value={type}>
                              {MILESTONE_LABELS[type as MilestoneType]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Only show threshold for milestones that need it */}
                    {(newTrigger.milestone_type === MilestoneType.ITINERARY_MILESTONE_3_ITEMS) && (
                      <div>
                        <Label>Threshold Value</Label>
                        <Input 
                          type="number" 
                          placeholder="e.g., 3 items" 
                          value={newTrigger.threshold_value} 
                          onChange={e => setNewTrigger(prev => ({ ...prev, threshold_value: e.target.value }))}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Number of items needed to trigger this milestone
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Survey to Trigger</Label>
                      <Select 
                        value={newTrigger.survey_id} 
                        onValueChange={(value) => setNewTrigger(prev => ({ ...prev, survey_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue>
                            {newTrigger.survey_id ? surveys.find(s => s.survey_id === newTrigger.survey_id)?.title : 'Select survey'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {surveys.map(survey => (
                            <SelectItem key={survey.survey_id} value={survey.survey_id}>
                              {survey.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-4">
                      <Switch 
                        id="trigger-active" 
                        checked={newTrigger.is_active}
                        onCheckedChange={(checked) => setNewTrigger(prev => ({ ...prev, is_active: checked }))}
                      />
                      <Label htmlFor="trigger-active">Enable trigger immediately</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button onClick={createMilestoneTrigger} disabled={!newTrigger.survey_id}>
                  Create Trigger
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {milestoneTriggers.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {milestoneTriggers.map(trigger => (
                <Card key={trigger.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {MILESTONE_LABELS[trigger.milestone_type]}
                        </CardTitle>
                        <CardDescription>
                          Triggers survey: {trigger.survey?.title || 'Unknown'}
                        </CardDescription>
                      </div>
                      <Badge variant={trigger.is_active ? 'default' : 'outline'}>
                        {trigger.is_active ? 'Active' : 'Disabled'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {trigger.threshold_value && (
                      <div className="flex items-center text-sm mb-2">
                        <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Threshold: {trigger.threshold_value}</span>
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                      Created: {new Date(trigger.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between pt-2">
                    <Button
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleTriggerActive(trigger.id, trigger.is_active)}
                    >
                      {trigger.is_active ? 'Disable' : 'Enable'}
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteTrigger(trigger.id)}
                    >
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-muted-foreground">No milestone triggers configured for this study</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsCreating(true)}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Create First Trigger
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 