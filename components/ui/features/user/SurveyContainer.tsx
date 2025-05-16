// ============================================================================
// SURVEY CONTAINER: Multi-step, milestone-aware survey flow
// ============================================================================

'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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

// Types
export interface SurveyContainerProps {
  survey: Survey;
  onComplete: () => void;
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
export function SurveyContainer({ survey, onComplete }: SurveyContainerProps) {
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
  const currentMilestone = survey.milestones[currentMilestoneIndex];
  
  // Get questions for the current milestone
  const milestoneQuestions = survey.fields.filter(field => field.milestone === currentMilestone);
  
  // Current question
  const currentQuestion = milestoneQuestions[currentQuestionIndex];
  
  // Calculate progress
  const totalQuestions = survey.fields.length;
  const completedQuestions = responses.length;
  const progressPercentage = Math.round((completedQuestions / totalQuestions) * 100);

  // Get the current field based on current milestone and question index
  const currentField = useMemo(() => {
    if (!currentMilestone) return null;
    const milestoneQuestions = survey.fields.filter(field => field.milestone === currentMilestone);
    return milestoneQuestions[currentQuestionIndex] || null;
  }, [survey.fields, currentMilestone, currentQuestionIndex]);

  // Get the current response if it exists
  const getCurrentResponse = (): SurveyResponse | undefined => {
    return responses.find(r => r.fieldId === currentQuestion.id);
  };

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

  // Handle response for current question with auto-save
  const handleResponse = (value: string | number | boolean | Array<string | number>) => {
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
    
    // Trigger auto-save
    debouncedSave(updatedResponses);
  };

  // Create a session if one doesn't exist
  useEffect(() => {
    const ensureSession = async () => {
      if (!session) {
        try {
          await createSession();
        } catch (error) {
          console.error('Failed to create session:', error);
          toast({
            title: 'Error',
            description: 'Failed to initialize session. Your responses may not be saved.',
            variant: 'destructive',
          });
        }
      } else if (session.metadata?.userName) {
        // If user name is available in the session, use it for personalization
        setUserName(session.metadata.userName);
      }
    };

    ensureSession();
  }, [session, createSession, toast]);

  // Load existing draft responses - check server first for logged-in users
  useEffect(() => {
    const loadDrafts = async () => {
      if (!session || !survey.id) return;
      
      try {
        // If user is logged in, try to fetch drafts from server first
        if (user?.id) {
          const response = await fetch(
            `${API_ROUTES.RESEARCH.SURVEY_DRAFTS(survey.id)}?session_id=${session.id}`, 
            { method: 'GET' }
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.draft && data.draft.responses && data.draft.responses.length > 0) {
              // Use server-side draft if available
              setResponses(data.draft.responses);
              
              // Update question index if we have one
              if (typeof data.draft.current_question_index === 'number') {
                setCurrentQuestionIndex(data.draft.current_question_index);
              }
              
              // Update milestone index if we have one
              if (typeof data.draft.current_milestone_index === 'number') {
                setCurrentMilestoneIndex(data.draft.current_milestone_index);
              }
              
              return;
            }
          }
        }
        
        // Fall back to localStorage if no server drafts or not logged in
        if (savedDraft && savedDraft.length > 0) {
          setResponses(savedDraft);
        }
      } catch (error) {
        console.error('Error loading draft responses:', error);
        // Fall back to localStorage if server fetch fails
        if (savedDraft && savedDraft.length > 0) {
          setResponses(savedDraft);
        }
      }
    };
    
    loadDrafts();
  }, [session, survey.id, savedDraft, user?.id]);

  // Track survey started when component mounts
  useEffect(() => {
    track(eventTypes.SURVEY_STARTED, { 
      survey_id: survey.id,
      survey_name: survey.name
    });

    return () => {
      // Enhanced abandonment tracking
      if (!isSurveyComplete && responses.length > 0) {
        trackSurveyAbandonment('close');
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Track survey abandonment when user leaves the page
  useEffect(() => {
    if (typeof window === 'undefined' || isSurveyComplete) return;
    
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Don't track if survey is complete
      if (isSurveyComplete) return;
      
      // Track survey abandonment
      trackSurveyAbandonment('navigation');
      
      // For better UX, we can show a confirmation dialog (browser-dependent)
      event.preventDefault();
      event.returnValue = 'Are you sure you want to leave? Your progress will be saved, but the survey will be incomplete.';
      return event.returnValue;
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSurveyComplete]);
  
  // Function to track survey abandonment with detailed analytics
  const trackSurveyAbandonment = async (reason: 'close' | 'navigation' | 'timeout' | 'other' = 'other') => {
    if (!session || isSurveyComplete) return;
    
    try {
      // Calculate time spent
      const now = new Date();
      const timeSpentSeconds = Math.floor((now.getTime() - surveyStartTime.getTime()) / 1000);
      
      // Prepare abandonment data
      const abandonData = {
        session_id: session.id,
        survey_id: survey.id,
        user_id: user?.id,
        current_question_index: currentQuestionIndex,
        current_milestone_index: currentMilestoneIndex,
        milestone: currentMilestone,
        time_spent_seconds: timeSpentSeconds,
        responses_so_far: responses.length,
        total_questions: totalQuestions,
        progress_percentage: progressPercentage,
        device_info: deviceInfo,
        viewport,
        reason,
        additional_details: {
          question_time_spent: questionTimeSpent,
          current_field_type: currentQuestion?.type,
        }
      };
      
      // First track via our existing tracking system
      track(eventTypes.SURVEY_ABANDONED, {
        reason,
        milestone: currentMilestone,
        current_question_index: currentQuestionIndex,
        current_milestone_index: currentMilestoneIndex,
        time_spent_seconds: timeSpentSeconds,
        progress_percentage: progressPercentage,
      });
      
      // Then send detailed analytics via the dedicated API endpoint
      // Use sendBeacon for reliability during page unload if available
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(abandonData)], { type: 'application/json' });
        navigator.sendBeacon(API_ROUTES.RESEARCH.SURVEY_ABANDON, blob);
      } else {
        // Fall back to fetch for older browsers
        fetch(API_ROUTES.RESEARCH.SURVEY_ABANDON, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(abandonData),
          // Use keepalive for fetch in case page is unloading
          keepalive: true
        }).catch(err => console.error('Error tracking abandonment:', err));
      }
    } catch (error) {
      console.error('Error tracking survey abandonment:', error);
    }
  };
  
  // Debounced auto-save function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce(async (updatedResponses: SurveyResponse[]) => {
      if (!session) return;
      
      setAutoSaveStatus('saving');
      
      try {
        // Always save to localStorage as a backup
        setSavedDraft(updatedResponses);
        
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
    [session, setSavedDraft, survey.id, user?.id, currentMilestone, currentQuestionIndex, currentMilestoneIndex, progressPercentage, questionTimeSpent]
  );

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

  // Show milestone celebration
  const celebrateMilestone = async () => {
    setShowMilestoneCelebration(true);
    
    // Track milestone completion
    await track(eventTypes.MILESTONE_REACHED, {
      milestone: currentMilestone,
      survey_id: survey.id
    }, currentMilestone);
    
    // Show celebration for 2 seconds, then proceed
    setTimeout(() => {
      setShowMilestoneCelebration(false);
      setCurrentMilestoneIndex(currentMilestoneIndex + 1);
      setCurrentQuestionIndex(0);
    }, 2000);
  };

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
    
    if (currentQuestionIndex < milestoneQuestions.length - 1) {
      // Move to next question in current milestone
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentMilestoneIndex < survey.milestones.length - 1) {
      // Milestone completed - show celebration
      celebrateMilestone();
    } else {
      // Survey is complete, submit responses
      handleSubmit();
    }
  };

  // Navigate to previous question or milestone
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      // Move to previous question in current milestone
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentMilestoneIndex > 0) {
      // Move to last question of previous milestone
      const previousMilestone = survey.milestones[currentMilestoneIndex - 1];
      const previousMilestoneQuestions = survey.fields.filter(field => field.milestone === previousMilestone);
      
      setCurrentMilestoneIndex(currentMilestoneIndex - 1);
      setCurrentQuestionIndex(previousMilestoneQuestions.length - 1);
    }
  };

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
                         currentQuestionIndex === milestoneQuestions.length - 1;

  // Get the progress step name (milestone name)
  const getMilestoneDisplayName = (milestone: string) => {
    return milestone
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

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
    if (isSurveyComplete) return;
    
    // Reset question start time when question changes
    setQuestionStartTime(new Date());
    
    // Update total time spent
    const now = new Date();
    const timeSpentSoFar = Math.floor((now.getTime() - surveyStartTime.getTime()) / 1000);
    setTotalTimeSpent(timeSpentSoFar);
    
    return () => {
      // Update question time spent when unmounting or changing question
      if (currentField) {
        const now = new Date();
        const timeSpent = Math.floor((now.getTime() - questionStartTime.getTime()) / 1000);
        setQuestionTimeSpent(prev => ({
          ...prev,
          [currentField.id]: (prev[currentField.id] || 0) + timeSpent
        }));
      }
    };
  }, [currentQuestionIndex, currentField, isSurveyComplete, questionStartTime, surveyStartTime]);

  // Error state UI
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <div
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          aria-live="assertive"
          className="w-full max-w-xl bg-destructive/10 border border-destructive rounded-xl p-8 shadow-lg flex flex-col items-center animate-fade-in focus:outline-none"
        >
          <svg
            className="w-12 h-12 text-destructive mb-4 animate-bounce"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h2 className="text-xl font-bold text-destructive mb-2">Oops, something went wrong!</h2>
          <p className="text-muted-foreground mb-4 text-center max-w-md">
            {error}
          </p>
          <div className="flex flex-wrap gap-2 mb-2">
            <Button variant="outline" onClick={onComplete}>
              Return to Survey List
            </Button>
            <Button variant="secondary" onClick={handleRetry}>
              Retry
            </Button>
          </div>
          <a
            href={`mailto:support@withme.travel?subject=Survey%20Error&body=I%20encountered%20an%20error%20on%20the%20survey%20page.%20Error:%20${encodeURIComponent(error)}`}
            className="text-xs text-blue-600 hover:underline mt-2"
            tabIndex={0}
          >
            Need help? Contact support
          </a>
        </div>
      </div>
    );
  }

  // Success state UI
  if (submitted) {
    // SSR-safe confetti: use a fixed size if window is undefined
    const confettiWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const confettiHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        {/* Confetti animation */}
        <Confetti width={confettiWidth} height={confettiHeight} numberOfPieces={200} recycle={false} />
        <Card
          ref={successRef}
          tabIndex={-1}
          role="status"
          aria-live="polite"
          className="w-full max-w-xl p-8 shadow-lg border-emerald-400 border-2 animate-fade-in focus:outline-none"
        >
          <CardHeader className="flex flex-col items-center">
            <div className="mb-4">
              <svg
                className="w-16 h-16 text-emerald-500 animate-bounce"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold text-emerald-700">Thank You{userName ? ', ' + userName : ''}!</CardTitle>
            <CardDescription className="mt-2 text-center text-lg text-muted-foreground">
              Your survey response has been submitted successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <p className="text-muted-foreground text-center mb-4">
              We appreciate your feedback and will use it to make WithMe even better for travelers like you.
            </p>
            {/* Optionally, add more animation here */}
          </CardContent>
          <CardFooter className="flex flex-col items-center gap-2">
            <Button onClick={onComplete} className="w-full max-w-xs">
              Return to Survey List
            </Button>
            <a
              href="/user-testing/survey"
              className="text-xs text-blue-600 hover:underline mt-2"
              tabIndex={0}
            >
              Take another survey
            </a>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
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
      <div className="mb-8">
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
        <Progress value={progressPercentage} className="h-2" />
        <div className="text-xs text-muted-foreground mt-2 text-right">
          {`${completedQuestions} of ${totalQuestions} questions completed`}
        </div>
      </div>

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
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <QuestionRenderer
              question={currentQuestion}
              response={getCurrentResponse()?.value}
              onChange={handleResponse}
              error={validationErrors[currentQuestion.id]}
            />
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
