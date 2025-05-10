'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, Info, Loader2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PreviewSectionProps {
  studyId: string;
}

// Simple representation of a trigger
interface Trigger {
  id: string;
  trigger_event: string;
  survey_id: string;
  min_delay_ms: number;
  max_triggers: number;
  active: boolean;
}

// Simple representation of a survey
interface Survey {
  id: string;
  survey_id?: string;
  title: string;
  description?: string;
  questions?: any[];
}

export default function PreviewSection({ studyId }: PreviewSectionProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [matchingTrigger, setMatchingTrigger] = useState<Trigger | null>(null);
  const [surveyData, setSurveyData] = useState<Survey | null>(null);
  const [showSurveyPreview, setShowSurveyPreview] = useState(false);
  const [flowVisualization, setFlowVisualization] = useState('simple');
  const [error, setError] = useState<string | null>(null);
  
  // Refs to track request state and debouncing
  const requestTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);
  const lastRequestTimeRef = useRef(0);
  
  // Clear any existing timeouts when unmounting
  useEffect(() => {
    return () => {
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  
  // Fetch data with debouncing and retry logic
  useEffect(() => {
    // Clear previous fetches when study changes
    if (requestTimeoutRef.current) {
      clearTimeout(requestTimeoutRef.current);
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Reset state when study changes
    if (!studyId) {
      setEvents([]);
      setTriggers([]);
      setSelectedEvent(null);
      return;
    }
    
    // Set loading state immediately
    setIsLoading(true);
    setError(null);
    
    // Debounce API calls
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTimeRef.current;
    const minDebounceTime = 1000; // At least 1 second between requests
    
    const delay = timeSinceLastRequest < minDebounceTime 
      ? minDebounceTime - timeSinceLastRequest 
      : 0;
    
    requestTimeoutRef.current = setTimeout(async () => {
      // Set last request time
      lastRequestTimeRef.current = Date.now();
      
      // Create new abort controller
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;
      
      try {
        // Fetch events
        try {
          const eventsResponse = await fetch(`/api/admin/research/events?study_id=${studyId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal
          });
          
          if (eventsResponse.status === 429) {
            // If rate limited, wait and retry with exponential backoff
            const retryAfter = eventsResponse.headers.get('Retry-After');
            const retryMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : 5000;
            
            toast({
              title: 'Rate limited',
              description: `Too many requests. Retrying in ${Math.ceil(retryMs/1000)} seconds.`,
              variant: 'default'
            });
            
            // Schedule retry with exponential backoff
            retryCountRef.current++;
            const backoffTime = retryMs * Math.pow(1.5, retryCountRef.current);
            
            requestTimeoutRef.current = setTimeout(() => {
              // Trigger a re-render which will retry
              setIsLoading(true);
            }, backoffTime);
            
            setIsLoading(false);
            return;
          } else if (eventsResponse.ok) {
            const eventsData = await eventsResponse.json();
            setEvents(Array.isArray(eventsData) ? eventsData : []);
            
            // If there are events and no event is selected, select the first one
            if (Array.isArray(eventsData) && eventsData.length > 0 && !selectedEvent) {
              setSelectedEvent(eventsData[0]);
            }
            
            // Reset retry count after successful request
            retryCountRef.current = 0;
          } else {
            console.error(`Error loading events: ${eventsResponse.status}`);
          }
        } catch (eventsError) {
          if (eventsError instanceof Error && eventsError.name !== 'AbortError') {
            console.error('Failed to load events:', eventsError);
          }
        }
        
        // Wait a bit to avoid simultaneous requests
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if aborted
        if (signal.aborted) return;
        
        // Fetch triggers
        try {
          const triggersResponse = await fetch(`/api/admin/research/triggers?studyId=${studyId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal
          });
          
          if (triggersResponse.status === 429) {
            // If rate limited, display message and continue
            toast({
              title: 'Rate limited',
              description: 'Too many trigger requests. Please wait a moment.',
              variant: 'default'
            });
          } else if (triggersResponse.ok) {
            const triggersData = await triggersResponse.json();
            
            // Handle both array response and object with triggers property
            const triggerArray = Array.isArray(triggersData) 
              ? triggersData 
              : (triggersData?.triggers || []);
              
            setTriggers(triggerArray);
          } else {
            console.error(`Error loading triggers: ${triggersResponse.status}`);
          }
        } catch (triggersError) {
          if (triggersError instanceof Error && triggersError.name !== 'AbortError') {
            console.error('Failed to load triggers:', triggersError);
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error loading preview data:', error);
          setError(error.message || 'Failed to load data');
        }
      } finally {
        setIsLoading(false);
      }
    }, delay);
    
    return () => {
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [studyId, toast, selectedEvent]);
  
  // Find matching trigger when event changes
  useEffect(() => {
    if (!selectedEvent || !triggers || !Array.isArray(triggers) || triggers.length === 0) {
      setMatchingTrigger(null);
      setSurveyData(null);
      return;
    }
    
    const match = triggers.find(
      trigger => trigger.trigger_event === selectedEvent && trigger.active
    );
    
    setMatchingTrigger(match || null);
    
    // Clear survey data if no match
    if (!match) {
      setSurveyData(null);
    } else {
      // Load survey data for this trigger
      fetchSurveyData(match.survey_id);
    }
  }, [selectedEvent, triggers]);
  
  // Fetch survey data for preview
  const fetchSurveyData = async (surveyId: string, retryCount = 0) => {
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      setIsLoading(true);
      
      // Try to get from surveys first
      let surveysResponse = await fetch('/api/admin/research/surveys', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      
      // Handle rate limiting
      if (surveysResponse.status === 429) {
        const retryAfter = surveysResponse.headers.get('Retry-After') || '3';
        const retryMs = parseInt(retryAfter, 10) * 1000;
        
        console.log(`Rate limited when fetching surveys. Will retry in ${retryMs}ms`);
        
        // Retry after the specified delay with exponential backoff
        if (retryCount < 2) {
          setTimeout(() => {
            if (isMounted) {
              fetchSurveyData(surveyId, retryCount + 1);
            }
          }, retryMs);
        } else {
          // Fall back to placeholder content if we've retried too many times
          createPlaceholderSurvey(surveyId);
        }
        
        return;
      }
      
      if (surveysResponse.ok) {
        const surveysData = await surveysResponse.json();
        const matchingSurvey = Array.isArray(surveysData) ? 
          surveysData.find(
            (s: any) => s.id === surveyId || s.survey_id === surveyId
          ) : null;
        
        if (matchingSurvey) {
          // For demo purposes, add some sample questions if none exist
          if (!matchingSurvey.questions || !matchingSurvey.questions.length) {
            matchingSurvey.questions = getSampleQuestions();
          }
          
          setSurveyData(matchingSurvey);
          return;
        }
      }
      
      // If not found or error, use a placeholder
      createPlaceholderSurvey(surveyId);
      
    } catch (error) {
      console.error('Error fetching survey data:', error);
      
      // Create a placeholder survey on error
      createPlaceholderSurvey(surveyId);
      
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
    
    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
  };
  
  // Helper to create a placeholder survey
  const createPlaceholderSurvey = (surveyId: string) => {
    setSurveyData({
      id: surveyId,
      title: 'Survey Preview',
      description: 'This is a preview of the survey that would be shown.',
      questions: getSampleQuestions()
    });
  };
  
  // Helper to get sample questions
  const getSampleQuestions = () => [
    {
      id: '1',
      text: 'How would you rate your experience?',
      type: 'rating',
      required: true,
      options: [1, 2, 3, 4, 5]
    },
    {
      id: '2',
      text: 'Please share any additional feedback.',
      type: 'text',
      required: false
    }
  ];
  
  const handleEventChange = (value: string) => {
    setSelectedEvent(value);
  };
  
  const handleShowSurveyPreview = () => {
    if (surveyData) {
      setShowSurveyPreview(true);
    } else {
      toast({
        title: 'No survey found',
        description: 'There is no survey associated with this event.',
        variant: 'destructive'
      });
    }
  };
  
  // Create a simplified flowchart visualization
  const renderFlowchart = () => {
    if (!selectedEvent) {
      return (
        <div className="text-center text-muted-foreground my-8">
          Select an event to visualize the flow
        </div>
      );
    }
    
    return (
      <div className="my-6 flex flex-col items-center">
        {/* Event node */}
        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-md mb-4">
          Event: {selectedEvent}
        </div>
        
        {/* Arrow */}
        <div className="w-px h-8 bg-border relative">
          <div className="absolute -right-2 bottom-0 border-l-[8px] border-l-transparent border-t-[8px] border-t-border border-r-[8px] border-r-transparent"></div>
        </div>
        
        {/* Check for matching trigger */}
        {matchingTrigger ? (
          <>
            {/* Trigger node */}
            <div className="bg-card border px-4 py-2 rounded-md mb-4 text-center">
              <div>Trigger: {matchingTrigger.trigger_event}</div>
              <div className="text-xs text-muted-foreground">Delay: {matchingTrigger.min_delay_ms}ms</div>
            </div>
            
            {/* Arrow */}
            <div className="w-px h-8 bg-border relative">
              <div className="absolute -right-2 bottom-0 border-l-[8px] border-l-transparent border-t-[8px] border-t-border border-r-[8px] border-r-transparent"></div>
            </div>
            
            {/* Survey node */}
            <div className="bg-accent text-accent-foreground px-4 py-2 rounded-md">
              Survey: {surveyData?.title || 'Unknown Survey'}
            </div>
          </>
        ) : (
          <div className="bg-destructive/10 text-destructive dark:bg-destructive/20 px-4 py-2 rounded-md text-center">
            No active trigger found for this event
          </div>
        )}
      </div>
    );
  };
  
  const handleRefresh = () => {
    // Cancel any pending requests
    if (requestTimeoutRef.current) {
      clearTimeout(requestTimeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Reset retry counter
    retryCountRef.current = 0;
    
    // Trigger a refresh by setting loading state
    setIsLoading(true);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        <span className="ml-2">Loading preview data...</span>
      </div>
    );
  }
  
  if (events.length === 0) {
    return (
      <Alert variant="default" className="bg-muted">
        <Info className="h-4 w-4" />
        <AlertDescription>
          No events found for this study. Events will appear here once they've been tracked.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <>
      <Card className="mt-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Preview</CardTitle>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : 'Refresh'}
            </Button>
          </div>
          <CardDescription>
            Select an event to see which triggers will fire
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-destructive/15 p-3 text-destructive flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              <p>{error}</p>
            </div>
          )}
          
          {isLoading ? (
            <div className="flex h-[200px] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {events.length === 0 ? (
                <div className="rounded-md border border-dashed p-6 text-center">
                  <p className="text-muted-foreground">No events found for this study</p>
                </div>
              ) : (
                <Tabs defaultValue={selectedEvent || events[0]} onValueChange={setSelectedEvent}>
                  <TabsList className="mb-4 w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {events.slice(0, 8).map((event) => (
                      <TabsTrigger key={event} value={event} className="truncate">
                        {event}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {events.map((event) => (
                    <TabsContent key={event} value={event}>
                      <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                          <h3 className="text-lg font-medium">Matching Triggers</h3>
                          
                          {triggers.filter(t => t.trigger_event === event).length === 0 ? (
                            <div className="rounded-md border border-dashed p-4 text-center">
                              <p className="text-sm text-muted-foreground">
                                No triggers set up for this event
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {triggers.filter(t => t.trigger_event === event).map((trigger) => (
                                <div key={trigger.id} className="rounded-md border p-3">
                                  <div className="flex justify-between items-center mb-2">
                                    <div className="font-medium">{trigger.survey_id}</div>
                                    <Badge variant={trigger.active ? "default" : "outline"}>
                                      {trigger.active ? "Active" : "Inactive"}
                                    </Badge>
                                  </div>
                                  <div className="text-sm flex flex-col gap-1">
                                    <p>Delay: {trigger.min_delay_ms}ms</p>
                                    <p>Max triggers: {trigger.max_triggers}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Survey Preview Dialog */}
      {surveyData && (
        <Dialog open={showSurveyPreview} onOpenChange={setShowSurveyPreview}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{surveyData.title}</DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              {surveyData.description && (
                <p className="text-sm text-muted-foreground mb-6">{surveyData.description}</p>
              )}
              
              {(surveyData.questions || []).map((question: any) => {
                if (question.type === 'text') {
                  return (
                    <div key={question.id} className="mb-6">
                      <Label className="mb-2 block">
                        {question.text} {question.required && <span className="text-destructive">*</span>}
                      </Label>
                      <Textarea
                        className="w-full"
                        placeholder="Your answer..."
                        disabled
                      />
                    </div>
                  );
                }
                
                if (question.type === 'rating') {
                  return (
                    <div key={question.id} className="mb-6">
                      <Label className="mb-2 block">
                        {question.text} {question.required && <span className="text-destructive">*</span>}
                      </Label>
                      <div className="flex space-x-2 justify-center">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <Button
                            key={rating}
                            variant="outline"
                            size="sm"
                            className="w-10 h-10"
                            disabled
                          >
                            {rating}
                          </Button>
                        ))}
                      </div>
                    </div>
                  );
                }
                
                if (question.type === 'multiple_choice' || question.type === 'single_choice') {
                  return (
                    <div key={question.id} className="mb-6">
                      <Label className="mb-2 block">
                        {question.text} {question.required && <span className="text-destructive">*</span>}
                      </Label>
                      <RadioGroup disabled>
                        {(question.options || []).map((option: any) => (
                          <div key={option.value || option} className="flex items-center space-x-2">
                            <RadioGroupItem
                              value={option.value || option}
                              id={`option-${option.value || option}`}
                              disabled
                            />
                            <Label htmlFor={`option-${option.value || option}`}>
                              {option.label || option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  );
                }
                
                return (
                  <div key={question.id} className="mb-6">
                    <p className="text-muted-foreground">
                      Unsupported question type: {question.type}
                    </p>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary" 
                onClick={() => setShowSurveyPreview(false)}
              >
                Close Preview
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
} 