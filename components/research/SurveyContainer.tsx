// ============================================================================
// SURVEY CONTAINER: Multi-step, milestone-aware survey flow
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { QuestionRenderer } from './QuestionRenderer';
import { useResearch } from './ResearchProvider';
import { useResearchTracking } from './useResearchTracking';
import { AnimatePresence, motion } from 'framer-motion';

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

/**
 * SurveyContainer component that orchestrates the multi-milestone survey experience
 * Handles progress tracking, navigation, validation, and response submission
 */
export function SurveyContainer({ survey, onComplete }: SurveyContainerProps) {
  const { toast } = useToast();
  const { saveResponses, session, createSession } = useResearch();
  const { track, eventTypes } = useResearchTracking();
  const [currentMilestoneIndex, setCurrentMilestoneIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      }
    };

    ensureSession();
  }, [session, createSession, toast]);

  // Track survey started when component mounts
  useEffect(() => {
    track(eventTypes.SURVEY_STARTED, { 
      survey_id: survey.id,
      survey_name: survey.name
    });

    return () => {
      // Track abandonment if component unmounts before completion
      if (responses.length > 0 && responses.length < survey.fields.length) {
        track(eventTypes.SURVEY_ABANDONED, {
          survey_id: survey.id,
          completed_questions: responses.length,
          total_questions: survey.fields.length
        });
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Handle response for current question
  const handleResponse = (value: string | number | boolean | Array<string | number>) => {
    const responseIndex = responses.findIndex(r => r.fieldId === currentQuestion.id);
    
    if (responseIndex >= 0) {
      // Update existing response
      const updatedResponses = [...responses];
      updatedResponses[responseIndex] = { fieldId: currentQuestion.id, value };
      setResponses(updatedResponses);
    } else {
      // Add new response
      setResponses([...responses, { fieldId: currentQuestion.id, value }]);
    }
  };

  // Get the current response if it exists
  const getCurrentResponse = (): SurveyResponse | undefined => {
    return responses.find(r => r.fieldId === currentQuestion.id);
  };

  // Check if the current question is valid (has a response if required)
  const isCurrentQuestionValid = (): boolean => {
    if (!currentQuestion.required) return true;
    
    const response = getCurrentResponse();
    if (!response) return false;
    
    // Check different types of values
    if (Array.isArray(response.value)) return response.value.length > 0;
    if (typeof response.value === 'string') return response.value.trim().length > 0;
    return response.value !== undefined && response.value !== null;
  };

  // Navigate to next question or milestone
  const handleNext = async () => {
    if (currentQuestionIndex < milestoneQuestions.length - 1) {
      // Move to next question in current milestone
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      
      // Track step completion
      await track(eventTypes.SURVEY_STEP_COMPLETED, {
        survey_id: survey.id,
        question_id: currentQuestion.id,
        milestone: currentMilestone
      });
    } else if (currentMilestoneIndex < survey.milestones.length - 1) {
      // Track milestone completion
      await track(eventTypes.MILESTONE_REACHED, {
        milestone: currentMilestone,
        survey_id: survey.id
      }, currentMilestone);
      
      // Move to first question of next milestone
      setCurrentMilestoneIndex(currentMilestoneIndex + 1);
      setCurrentQuestionIndex(0);
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
      
      onComplete();
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
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <div className="p-6 md:p-8">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {survey.milestones.map((milestone, index) => (
            <div 
              key={milestone}
              className={`text-xs font-medium ${index <= currentMilestoneIndex ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {getMilestoneDisplayName(milestone)}
            </div>
          ))}
        </div>
        <Progress value={progressPercentage} className="h-2" />
        <div className="text-xs text-muted-foreground mt-2 text-right">
          {`${completedQuestions} of ${totalQuestions} questions completed`}
        </div>
      </div>

      {/* Question card */}
      <Card className="p-6 mb-6">
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
        >
          Previous
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={!isCurrentQuestionValid() || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : isFinalQuestion ? 'Submit' : 'Next'}
        </Button>
      </div>
    </div>
  );
}
