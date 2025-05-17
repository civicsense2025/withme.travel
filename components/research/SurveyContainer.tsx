// ============================================================================
// SURVEY CONTAINER: Multi-step, milestone-aware survey flow
// ============================================================================

'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { QuestionRenderer } from '@/components/ui/features/user-testing/molecules/QuestionRenderer';
import { useResearch } from './ResearchProvider';
import { useResearchTracking } from './useResearchTracking';
import { AnimatePresence, motion } from 'framer-motion';
import { Confetti } from './Confetti';
import { debounce } from 'lodash';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { API_ROUTES } from '@/utils/constants/routes';
import { useAuth } from '@/lib/hooks/use-auth';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

// Types
interface SurveyContainerProps {
  survey: Survey;
  onComplete: () => void;
  className?: string;
}

export interface Survey {
  id: string;
  name: string;
  description?: string;
  milestones: string[];
  fields: SurveyField[];
}

export interface SurveyField {
  id: string;
  milestone: string;
  label: string;
  type: string;
  options?: Array<string | number | any>;
  required: boolean;
}

export interface SurveyResponse {
  fieldId: string;
  value: string | number | boolean | Array<string | number>;
}

// Auto-save states
type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/**
 * SurveyContainer component that orchestrates the multi-milestone survey experience
 * Handles progress tracking, navigation, validation, and response submission
 * Features auto-save, smooth animations, and accessibility enhancements
 */
export function SurveyContainer({
  survey: initialSurvey,
  onComplete,
  className,
}: SurveyContainerProps) {
  // Create a safe copy of the survey with validated milestones
  const survey = useMemo(() => {
    if (!initialSurvey || !initialSurvey.id) {
      return null;
    }
    
    // Create a deep copy to avoid mutating props
    const safeSurvey = { ...initialSurvey };
    
    // Ensure milestones is a valid array with at least one value
    if (!Array.isArray(safeSurvey.milestones) || safeSurvey.milestones.length === 0) {
      console.error('[SurveyContainer] Survey has no milestones:', safeSurvey.id);
      safeSurvey.milestones = ['default'];
      console.log('[SurveyContainer] Added default milestone');
    }
    
    // Ensure fields is a valid array
    if (!Array.isArray(safeSurvey.fields)) {
      console.error('[SurveyContainer] Survey has no fields array:', safeSurvey.id);
      safeSurvey.fields = [];
    }
    
    // Make sure each field has a valid milestone
    if (safeSurvey.fields.length > 0) {
      safeSurvey.fields = safeSurvey.fields.map(field => ({
        ...field,
        milestone: field.milestone && safeSurvey.milestones.includes(field.milestone) 
          ? field.milestone 
          : safeSurvey.milestones[0]
      }));
    }
    
    return safeSurvey;
  }, [initialSurvey]);
  
  // Add debugging log
  console.log('[SurveyContainer] Rendering survey:', { 
    id: survey?.id,
    name: survey?.name,
    milestones: survey?.milestones?.length || 0,
    fields: survey?.fields?.length || 0,
    hasOnComplete: !!onComplete
  });
  
  // Early validation to provide better error messages
  if (!survey || !survey.id) {
    console.error('[SurveyContainer] Invalid survey data provided');
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-medium text-red-800">Unable to load survey</h3>
        <p className="text-red-600">The survey data is missing or invalid.</p>
        {onComplete && (
          <Button onClick={onComplete} className="mt-4">Return to Survey List</Button>
        )}
      </div>
    );
  }
  
  if (!Array.isArray(survey.fields) || survey.fields.length === 0) {
    console.error('[SurveyContainer] Survey has no fields:', survey.id);
    return (
      <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg">
        <h3 className="text-lg font-medium text-amber-800">Empty Survey</h3>
        <p className="text-amber-600">This survey doesn't have any questions. It might be a configuration issue.</p>
        {onComplete && (
          <Button onClick={onComplete} className="mt-4">Return to Survey List</Button>
        )}
      </div>
    );
  }

  const { toast } = useToast();
  const { saveResponses, session, createSession } = useResearch();
  const { track, eventTypes } = useResearchTracking();
  const { user } = useAuth();
  const [currentMilestoneIndex, setCurrentMilestoneIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>('idle');
  const [showMilestoneCelebration, setShowMilestoneCelebration] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  
  // Get persisted draft responses from localStorage
  const [savedDraft, setSavedDraft] = useLocalStorage<SurveyResponse[]>(`survey_draft_${survey.id}`, []);
  
  // Refs for focus management and keyboard navigation
  const errorRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const questionCardRef = useRef<HTMLDivElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  // Time tracking for abandonment analytics
  const [surveyStartTime] = useState<Date>(new Date());
  const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date());
  const [totalTimeSpent, setTotalTimeSpent] = useState<number>(0);
  const [questionTimeSpent, setQuestionTimeSpent] = useState<Record<string, number>>({});
  
  // Track device info for analytics
  const [deviceInfo] = useState<Record<string, any>>({
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    platform: typeof navigator !== 'undefined' ? navigator.platform : '',
    language: typeof navigator !== 'undefined' ? navigator.language : '',
  });
  
  // Track viewport size for analytics
  const [viewport, setViewport] = useState<{ width: number; height: number } | undefined>(
    typeof window !== 'undefined' 
      ? { width: window.innerWidth, height: window.innerHeight }
      : undefined
  );
  
  // Update viewport size on resize
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check if a response value is valid based on its type
  const isResponseValid = (value: any): boolean => {
    if (value === undefined || value === null) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'string') return value.trim().length > 0;
    return true;
  };

  // Compute if the survey is complete (all required questions answered)
  const isSurveyComplete = useMemo(() => {
    if (!session) return false;
    
    // Check if all required questions have valid responses
    for (const field of survey.fields) {
      if (field.required) {
        const response = responses.find(r => r.fieldId === field.id);
        if (!response || !isResponseValid(response.value)) {
          return false;
        }
      }
    }
    
    return responses.length > 0;
  }, [responses, survey.fields, session]);

  // Get the current milestone
  const currentMilestone = survey.milestones && survey.milestones.length > 0 
    ? survey.milestones[Math.min(currentMilestoneIndex, survey.milestones.length - 1)] 
    : 'default';
  
  // Utility: filter out non-question fields
  const isRealQuestion = (field: SurveyField) => {
    return field.type !== 'welcome' && field.type !== 'completion';
  };

  // Replace all usages of survey.fields with realQuestions where appropriate
  const realQuestions = useMemo(() => survey.fields.filter(isRealQuestion), [survey.fields]);
  
  // Calculate progress using realQuestions
  const totalQuestions = realQuestions.length;
  const completedQuestions = responses.filter(r => realQuestions.some(q => q.id === r.fieldId)).length;
  const progressPercentage = totalQuestions > 0 
    ? Math.min(100, Math.max(0, Math.round((completedQuestions / totalQuestions) * 100))) 
    : 0; // Ensure it's between 0-100

  // Get questions for the current milestone, filtered to real questions only
  const milestoneQuestions = survey.fields.filter(field => field.milestone === currentMilestone && isRealQuestion(field));
  const currentQuestion = milestoneQuestions[currentQuestionIndex] || null;

  // Get the current response if it exists
  const getCurrentResponse = useCallback((): SurveyResponse | undefined => {
    if (!currentQuestion) return undefined;
    return responses.find(r => r.fieldId === currentQuestion.id);
  }, [currentQuestion, responses]);

  // Check if the current question is valid (has a response if required)
  const validateCurrentQuestion = (): boolean => {
    if (!currentQuestion.required) return true;
    
    const response = getCurrentResponse();
    if (!response) {
      setValidationErrors(prev => ({
        ...prev,
        [currentQuestion.id]: 'This question requires an answer'
      }));
      return false;
    }
    
    const isValid = isResponseValid(response.value);
    if (!isValid) {
      setValidationErrors(prev => ({
        ...prev,
        [currentQuestion.id]: 'Please provide a valid answer'
      }));
    }
    
    return isValid;
  };

  // Create debounced save function - Fix: Create this outside of handleResponse
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce(async (updatedResponses: SurveyResponse[]) => {
      if (!session) return;
      
      setAutoSaveStatus('saving');
      
      try {
        // Always save to localStorage as a backup
        setSavedDraft(prevResponses => {
          // Merge logic: prioritize savedDraft over prevResponses
          const merged = [...prevResponses];
          updatedResponses.forEach(response => {
            const existingIndex = merged.findIndex(
              r => r.fieldId === response.fieldId
            );
            if (existingIndex >= 0) {
              merged[existingIndex] = response;
            } else {
              merged.push(response);
            }
          });
          return merged;
        });
        
        // Save to server if user is authenticated
        if (user?.id) {
          // Prepare draft data
          const draftData = {
            session_id: session.id,
            responses: updatedResponses,
            milestone: currentMilestone,
            current_question_index: currentQuestionIndex,
            current_milestone_index: currentMilestoneIndex,
            last_activity_timestamp: new Date().toISOString(),
            metadata: {
              progress_percentage: progressPercentage,
              question_time_spent: questionTimeSpent
            }
          };
          
          // Save to the server
          await fetch(API_ROUTES.RESEARCH.SURVEY_DRAFTS(survey.id), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(draftData)
          });
        }
        
        setAutoSaveStatus('saved');
        
        // Reset the "saved" status after 2 seconds
        setTimeout(() => {
          setAutoSaveStatus('idle');
        }, 2000);
      } catch (error) {
        console.error('Auto-save error:', error);
        setAutoSaveStatus('error');
      }
    }, 800),
    // Fix: Remove items that change on each render from the dependency array
    // Only include stable values that are actually used in the debounced function
    [session, setSavedDraft, survey.id, user?.id]
  );

  // Handle response for current question WITHOUT auto-save
  const handleResponse = useCallback((value: string | number | boolean | Array<string | number>) => {
    // Exit early if no current question is defined
    if (!currentQuestion) {
      console.error('No current question defined');
      return;
    }

    console.log(`[SurveyContainer] Handling response for question ${currentQuestion.id}:`, value);

    const responseIndex = responses.findIndex(r => r.fieldId === currentQuestion.id);
    let updatedResponses: SurveyResponse[];
    
    if (responseIndex >= 0) {
      // Update existing response
      updatedResponses = [...responses];
      updatedResponses[responseIndex] = { fieldId: currentQuestion.id, value };
    } else {
      // Add new response
      updatedResponses = [...responses, { fieldId: currentQuestion.id, value }];
    }
    
    setResponses(updatedResponses);
    
    // Clear any validation errors for this field when the user makes changes
    if (validationErrors[currentQuestion.id]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[currentQuestion.id];
        return updated;
      });
    }
    // --- AUTOSAVE DISABLED ---
    // debouncedSave(updatedResponses);
  }, [currentQuestion, responses, validationErrors]);

  // Session setup effect - Ensure we have a valid session before proceeding
  useEffect(() => {
    const ensureSession = async () => {
      try {
        if (!session) {
          console.log('[SurveyContainer] No existing session found, creating one');
          // Create a new session with the provided token
          const newSession = await createSession();
          console.log('[SurveyContainer] Created new session:', newSession.id);
          
          // Track survey start event
          await track(eventTypes.SURVEY_STARTED, {
            survey_id: survey.id,
            survey_name: survey.name,
            device_info: deviceInfo,
            viewport: viewport || { width: 0, height: 0 }
          });
        } else {
          console.log('[SurveyContainer] Using existing session:', session.id);
        }
      } catch (error) {
        console.error('[SurveyContainer] Error creating session:', error);
        setError('Failed to initialize survey session. Please refresh the page and try again.');
      }
    };
    
    const loadDrafts = async () => {
      if (savedDraft && savedDraft.length > 0) {
        setResponses(prevResponses => {
          // Merge logic: prioritize savedDraft over prevResponses
          const merged = [...prevResponses];
          savedDraft.forEach(draftResponse => {
            const existingIndex = merged.findIndex(
              r => r.fieldId === draftResponse.fieldId
            );
            if (existingIndex >= 0) {
              merged[existingIndex] = draftResponse;
            } else {
              merged.push(draftResponse);
            }
          });
          return merged;
        });
      }
    };
    
    // Run session setup and draft loading in sequence
    const initialize = async () => {
      await ensureSession();
      await loadDrafts();
    };
    
    initialize();
    
    // Cleanup user abandonment tracking
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Only track abandonment if we started but didn't finish
      if (session && !submitted && responses.length > 0) {
        // Track abandonment in sync before page unloads
        try {
          // Using navigator.sendBeacon for async tracking that survives page unload
          if (navigator.sendBeacon) {
            const data = JSON.stringify({
              event_type: eventTypes.SURVEY_ABANDONED,
              survey_id: survey.id,
              session_id: session.id,
              completed_questions: responses.length,
              total_questions: survey.fields.length,
              time_spent: Math.floor((new Date().getTime() - surveyStartTime.getTime()) / 1000),
              abandon_reason: 'close',
              last_question_index: currentQuestionIndex,
              current_milestone: currentMilestone
            });
            
            navigator.sendBeacon('/api/research/events', data);
          }
        } catch (e) {
          console.error('Failed to track survey abandonment:', e);
        }
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [survey.id, survey.name, survey.fields.length, deviceInfo, viewport, session, createSession, track, eventTypes.SURVEY_STARTED, savedDraft, responses, submitted, currentQuestionIndex, currentMilestone, surveyStartTime]);

  // Focus error or success card when shown
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus();
    }
    if (submitted && successRef.current) {
      successRef.current.focus();
    }
  }, [error, submitted]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (document.activeElement === questionCardRef.current || 
          document.activeElement?.tagName === 'BODY') {
        if (event.key === 'Enter' || event.key === 'ArrowRight') {
          event.preventDefault();
          nextButtonRef.current?.click();
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault();
          handlePrevious();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Navigate to next question or milestone
  const handleNext = async () => {
    // Validate the current question
    if (!validateCurrentQuestion()) {
      // Focus the question card for accessibility
      questionCardRef.current?.focus();
      
      toast({
        title: 'Please check your answer',
        description: validationErrors[currentQuestion.id],
        variant: 'destructive',
      });
      
      return;
    }
    
    // Track step completion
    await track(eventTypes.SURVEY_STEP_COMPLETED, {
      survey_id: survey.id,
      question_id: currentQuestion.id,
      milestone: currentMilestone
    });
    
    console.log('[SurveyContainer] Navigation - Current state:', {
      currentQuestionIndex,
      totalQuestionsInMilestone: realQuestions.length,
      currentMilestoneIndex,
      totalMilestones: survey.milestones.length,
      atLastQuestion: currentQuestionIndex >= realQuestions.length - 1,
      atLastMilestone: currentMilestoneIndex >= survey.milestones.length - 1
    });
    
    if (currentQuestionIndex < realQuestions.length - 1) {
      // Move to next question in current milestone
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      console.log('[SurveyContainer] Moving to next question:', currentQuestionIndex + 1);
    } else if (currentMilestoneIndex < survey.milestones.length - 1) {
      // Milestone completed - show celebration
      console.log('[SurveyContainer] Milestone completed, showing celebration');
      celebrateMilestone();
    } else {
      // Survey is complete, submit responses
      console.log('[SurveyContainer] Survey completed, submitting responses');
      handleSubmit();
    }
  };

  // Navigate to previous question or milestone
  const handlePrevious = useCallback(() => {
    console.log('[SurveyContainer] Navigating to previous question from:', {
      currentQuestionIndex,
      currentMilestoneIndex
    });
    
    if (currentQuestionIndex > 0) {
      // Move to previous question in current milestone
      console.log('[SurveyContainer] Moving to previous question in same milestone');
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentMilestoneIndex > 0) {
      // Move to last question of previous milestone
      const previousMilestone = survey.milestones[currentMilestoneIndex - 1];
      const previousMilestoneQuestions = survey.fields.filter(field => field.milestone === previousMilestone);
      const lastQuestionIndex = Math.max(0, previousMilestoneQuestions.length - 1);
      
      console.log('[SurveyContainer] Moving to previous milestone:', {
        previousMilestone,
        questionsInPreviousMilestone: previousMilestoneQuestions.length,
        targetQuestionIndex: lastQuestionIndex
      });
      
      setCurrentMilestoneIndex(currentMilestoneIndex - 1);
      setCurrentQuestionIndex(lastQuestionIndex);
    } else {
      console.log('[SurveyContainer] Already at first question of first milestone, cannot go back');
    }
  }, [currentQuestionIndex, currentMilestoneIndex, survey.milestones, survey.fields]);

  // Submit all responses
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Save responses using the ResearchProvider
      await saveResponses(survey.id, responses.map(r => ({ id: r.fieldId, value: r.value })));
      
      // Track survey completion
      await track(eventTypes.SURVEY_COMPLETED, {
        survey_id: survey.id,
        survey_name: survey.name,
        responses_count: responses.length
      });
      
      toast({
        title: 'Survey Completed',
        description: 'Your responses have been submitted successfully.',
      });
      
      // Clear the saved draft since submission was successful
      setSavedDraft([]);
      
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting responses:', error);
      
      toast({
        title: 'Submission Error',
        description: 'There was a problem submitting your responses. Please try again.',
        variant: 'destructive',
      });
      
      // Track error
      await track(eventTypes.ERROR_ENCOUNTERED, {
        survey_id: survey.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle retry for failed submissions
  const handleRetry = () => {
    setError(null);
    setIsSubmitting(false);
    window.location.reload();
  };

  // Determine if it's the final question
  const isFinalQuestion = currentMilestoneIndex === survey.milestones.length - 1 && 
                         currentQuestionIndex === realQuestions.length - 1;

  // Get the progress step name (milestone name)
  const getMilestoneDisplayName = useCallback((milestone: string) => {
    return milestone
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, []);

  // Render the milestone celebration screen
  const renderMilestoneCelebration = () => (
    <motion.div 
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Confetti width={typeof window !== 'undefined' ? window.innerWidth : 1200} 
                height={typeof window !== 'undefined' ? window.innerHeight : 800} 
                numberOfPieces={100} />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 12 }}
        className="bg-white dark:bg-gray-800 p-8 rounded-xl max-w-md text-center shadow-lg"
      >
        <div className="mb-4 text-4xl">🎉</div>
        <h2 className="text-2xl font-bold mb-2">Milestone Completed!</h2>
        <p className="text-muted-foreground mb-4">
          You've completed the {getMilestoneDisplayName(currentMilestone)} section.
        </p>
        <p className="text-primary font-medium">
          Moving to the next section...
        </p>
      </motion.div>
    </motion.div>
  );

  // Track time spent on current question
  useEffect(() => {
    if (isSurveyComplete || !currentQuestion?.id) return;
    
    console.log('[SurveyContainer:TimeTracking] Question changed, updating timers');
    
    // Reset question start time when question changes
    const newStartTime = new Date();
    const currentFieldId = currentQuestion?.id;
    
    return () => {
      // Update question time spent when unmounting or changing question
      if (currentFieldId) {
        const now = new Date();
        const timeSpent = Math.floor((now.getTime() - newStartTime.getTime()) / 1000);
        if (timeSpent > 0) {
          setQuestionTimeSpent(prev => ({
            ...prev,
            [currentFieldId]: (prev[currentFieldId] || 0) + timeSpent
          }));
        }
      }
    };
  }, [currentQuestionIndex, currentQuestion?.id, isSurveyComplete]);

  // Debug logging for survey data
  console.log('[SurveyContainer] Rendering survey:', { 
    id: survey?.id,
    name: survey?.name,
    milestones: survey?.milestones,
    fields: survey?.fields?.length || 0
  });

  // Add detailed structure logging
  if (process.env.NODE_ENV !== 'production') {
    console.log('[SurveyContainer] Survey structure check:', {
      validId: !!survey?.id,
      validMilestones: Array.isArray(survey?.milestones),
      milestoneCount: Array.isArray(survey?.milestones) ? survey.milestones.length : 0,
      validFields: Array.isArray(survey?.fields),
      fieldCount: Array.isArray(survey?.fields) ? survey.fields.length : 0,
      firstMilestone: Array.isArray(survey?.milestones) && survey.milestones.length > 0 ? survey.milestones[0] : null
    });
  }

  // Check if we have valid survey data
  if (!survey) {
    console.error('[SurveyContainer] No survey data provided');
    return (
      <Alert variant="destructive" className={cn('my-4', className)}>
        <AlertDescription>
          Unable to load survey. The survey may not exist or you may not have access.
        </AlertDescription>
      </Alert>
    );
  }

  // Check if we have valid form fields data
  if (!survey.fields || !Array.isArray(survey.fields) || survey.fields.length === 0) {
    console.error('[SurveyContainer] Survey has no form fields:', survey.id);
    return (
      <Alert variant="destructive" className={cn('my-4', className)}>
        <AlertDescription>
          This survey doesn't have any questions yet. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  // Filter fields for the current milestone or show all if no milestones
  const currentFields = useMemo(() => {
    // If we have milestones and current milestone, filter fields
    if (Array.isArray(survey.milestones) && survey.milestones.length > 0 && currentMilestone) {
      const fields = survey.fields.filter(
        (field: any) => !field.milestone || field.milestone === currentMilestone
      );
      console.log(`[SurveyContainer] Showing ${fields.length} fields for milestone: ${currentMilestone}`);
      return fields;
    }
    
    // Otherwise show all fields
    console.log(`[SurveyContainer] Showing all ${survey.fields.length} fields (no milestone filtering)`);
    return survey.fields;
  }, [survey.fields, survey.milestones, currentMilestone]);

  // Handle form value changes
  const handleChange = useCallback(
    (fieldId: string, value: any) => {
      console.log(`[SurveyContainer] Field ${fieldId} changed to:`, value);
      setResponses(prev => prev.map(r =>
        r.fieldId === fieldId ? { ...r, value } : r
      ));
    },
    []
  );

  // Determine if we're on the last milestone
  const isLastMilestone = useMemo(() => {
    if (!Array.isArray(survey.milestones) || survey.milestones.length === 0) {
      return true; // If no milestones, treat as last
    }
    return currentMilestone === survey.milestones[survey.milestones.length - 1];
  }, [survey.milestones, currentMilestone]);

  // Show milestone celebration
  const celebrateMilestone = async () => {
    console.log('[SurveyContainer] Showing celebration for milestone:', currentMilestone);
    
    // Set state for showing celebration
    setShowMilestoneCelebration(true);
    
    // Track milestone completion
    await track(eventTypes.MILESTONE_REACHED, {
      milestone: currentMilestone,
      survey_id: survey.id
    }, currentMilestone);
    
    // Use a timeout to ensure state updates don't conflict
    setTimeout(() => {
      // Only proceed if component is still mounted
      if (!isMounted.current) return;
      
      console.log('[SurveyContainer] Celebration complete, moving to next milestone');
      
      // Move to next milestone and reset question index
      const nextMilestoneIndex = currentMilestoneIndex + 1;
      setCurrentMilestoneIndex(nextMilestoneIndex);
      setCurrentQuestionIndex(0);
      
      // Hide celebration after state is updated
      setTimeout(() => {
        setShowMilestoneCelebration(false);
      }, 100);
    }, 2000);
  };

  // Add a ref to track component mounting state
  const isMounted = useRef(true);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Memoize the progress indicator to prevent unnecessary re-renders
  const progressIndicator = useMemo(() => {
    return (
      <div className="mb-8">
        {Array.isArray(survey.milestones) && survey.milestones.length > 0 ? (
          <>
            <div className="flex justify-between mb-2">
              {survey.milestones.map((milestone, index) => (
                <div 
                  key={milestone}
                  className={`text-xs font-medium ${index <= currentMilestoneIndex ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  {getMilestoneDisplayName(milestone)}
                  {index <= currentMilestoneIndex && (
                    <span className="ml-1">
                      {index < currentMilestoneIndex && (
                        <CheckCircle className="w-3 h-3 inline text-green-500 mb-1" />
                      )}
                    </span>
                  )}
                </div>
              ))}
            </div>
            {/* Replace Radix Progress with custom implementation */}
            <div className="relative h-2 w-full rounded-full bg-secondary overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all" 
                style={{ width: `${progressPercentage}%` }}
                role="progressbar"
                aria-valuenow={progressPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-2 text-right">
              {`${completedQuestions} of ${totalQuestions} questions completed`}
            </div>
          </>
        ) : (
          <div className="text-amber-500 mb-4">
            <Alert variant="warning">
              <AlertDescription>
                This survey has no milestones defined. Please contact an administrator.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    );
  }, [survey.milestones, currentMilestoneIndex, progressPercentage, completedQuestions, totalQuestions, getMilestoneDisplayName]);

  // Render the survey form
  return (
    <div className={cn('space-y-6', className)}>
      {/* Show milestone celebration when a milestone is completed */}
      {showMilestoneCelebration && renderMilestoneCelebration()}
      
      {/* Personal greeting if user name available */}
      {userName && (
        <div className="mb-4">
          <h2 className="text-xl font-medium">Hi {userName}!</h2>
          <p className="text-muted-foreground">Thanks for helping us improve WithMe Travel.</p>
        </div>
      )}
      
      {/* Progress indicator */}
      {progressIndicator}

      {/* Auto-save status indicator */}
      <div className="mb-2 flex justify-end">
        {autoSaveStatus === 'saving' && (
          <Badge variant="outline" className="text-xs animate-pulse">
            Saving...
          </Badge>
        )}
        {autoSaveStatus === 'saved' && (
          <Badge variant="outline" className="text-xs text-green-500">
            <CheckCircle className="w-3 h-3 mr-1" /> Saved
          </Badge>
        )}
        {autoSaveStatus === 'error' && (
          <Badge variant="outline" className="text-xs text-destructive">
            <AlertCircle className="w-3 h-3 mr-1" /> Auto-save failed
          </Badge>
        )}
      </div>

      {/* Question card */}
      <Card 
        className="p-6 mb-6"
        ref={questionCardRef}
        tabIndex={0}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`question-${currentQuestion?.id || 'loading'}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentQuestion ? (
              <QuestionRenderer
                key={`renderer-${currentQuestion.id}`}
                question={currentQuestion}
                response={getCurrentResponse()?.value}
                onChange={handleResponse}
                error={validationErrors[currentQuestion.id]}
              />
            ) : (
              <div className="text-center p-4">
                <Spinner />
                <p className="mt-2 text-muted-foreground">Loading question...</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentMilestoneIndex === 0 && currentQuestionIndex === 0}
          className="gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={isSubmitting}
          ref={nextButtonRef}
          className="gap-1"
        >
          {isSubmitting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              Submitting...
            </>
          ) : (
            <>
              {isFinalQuestion ? 'Submit' : 'Next'} 
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
