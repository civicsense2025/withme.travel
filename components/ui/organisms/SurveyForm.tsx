/**
 * SurveyForm
 * 
 * A component that manages a multi-step survey, handling navigation,
 * validation, and submission of responses.
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SurveyProgressBar } from './SurveyProgressBar';
import { QuestionRenderer, Question } from './QuestionRenderer';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Survey, SurveyQuestion } from '@/types/research';
import { useResearchTracking } from '@/hooks/use-research-tracking';

// ============================================================================
// TYPES
// ============================================================================

export interface SurveyFormProps {
  /** The survey to render */
  survey: Survey;
  /** Whether the survey is loading */
  loading?: boolean;
  /** Callback when the survey is submitted */
  onSubmit: (responses: Record<string, any>) => Promise<void>;
  /** Optional class name for custom styling */
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Transforms a SurveyQuestion into the Question format required by QuestionRenderer
 */
function adaptSurveyQuestion(sq: SurveyQuestion): Question {
  // Map question type to QuestionRenderer types
  const mapQuestionType = (type: string): 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'rating' => {
    switch (type) {
      case 'single_choice':
        return 'radio';
      case 'multiple_choice':
        return 'checkbox';
      case 'text':
      case 'textarea':
      case 'rating':
        return type as any;
      default:
        return 'text';
    }
  };

  return {
    id: sq.id,
    text: sq.label,
    type: mapQuestionType(sq.type),
    options: sq.options,
    required: sq.required || false,
    description: sq.description,
    placeholder: sq.config?.placeholder,
    // Add any other needed properties
    config: sq.config || {}
  };
}

// ============================================================================
// COMPONENT
// ============================================================================

export function SurveyForm({
  survey,
  loading = false,
  onSubmit,
  className
}: SurveyFormProps) {
  // State for current question index
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // State for survey responses
  const [responses, setResponses] = useState<Record<string, any>>({});
  
  // State for validation
  const [showValidation, setShowValidation] = useState(false);
  
  // State for submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Get the current question
  const questions = survey.questions || survey.config?.fields || [];
  const currentQuestion = questions[currentQuestionIndex];
  const adaptedQuestion = currentQuestion ? adaptSurveyQuestion(currentQuestion) : null;
  
  // Calculate progress
  const progress = Math.round(((currentQuestionIndex + 1) / questions.length) * 100);
  
  // Get research tracking hook
  const { trackEvent } = useResearchTracking();
  
  // Reset the form when the survey changes
  useEffect(() => {
    setCurrentQuestionIndex(0);
    setResponses({});
    setShowValidation(false);
    setIsCompleted(false);
  }, [survey.id]);
  
  // Handle response change
  const handleResponseChange = useCallback((value: any) => {
    if (!currentQuestion) return;
    
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
    
    // Track the response change
    trackEvent('survey_question_answered', {
      survey_id: survey.id,
      question_id: currentQuestion.id,
      question_type: currentQuestion.type
    });
  }, [currentQuestion, survey.id, trackEvent]);
  
  // Validate current question
  const isCurrentQuestionValid = useCallback(() => {
    const value = responses[currentQuestion.id];
    
    if (!currentQuestion.required) {
      return true;
    }
    
    switch (currentQuestion.type) {
      case 'text':
      case 'textarea':
      case 'select':
      case 'radio':
        return Boolean(value);
      case 'checkbox':
        return value === true;
      case 'rating':
        return typeof value === 'number';
      default:
        return true;
    }
  }, [currentQuestion, responses]);
  
  // Handle previous button click
  const handlePreviousClick = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowValidation(false);
      
      trackEvent('survey_navigate_previous', {
        survey_id: survey.id,
        from_question_id: currentQuestion.id
      });
    }
  }, [currentQuestionIndex, currentQuestion.id, survey.id, trackEvent]);
  
  // Handle next button click
  const handleNextClick = useCallback(() => {
    // Show validation
    setShowValidation(true);
    
    // If the current question is valid, proceed
    if (isCurrentQuestionValid()) {
      if (currentQuestionIndex < questions.length - 1) {
        // Go to next question
        setCurrentQuestionIndex(prev => prev + 1);
        setShowValidation(false);
        
        trackEvent('survey_navigate_next', {
          survey_id: survey.id,
          from_question_id: currentQuestion.id
        });
      } else {
        // Submit the survey if on the last question
        handleSubmit();
      }
    }
  }, [currentQuestionIndex, questions.length, isCurrentQuestionValid, currentQuestion.id, survey.id, trackEvent]);
  
  // Handle survey submission
  const handleSubmit = useCallback(async () => {
    // Show validation for the last question
    setShowValidation(true);
    
    // Ensure all questions are answered
    const unansweredRequired = questions
      .filter(q => q.required)
      .filter(q => !responses[q.id]);
    
    if (unansweredRequired.length > 0) {
      // Find the first unanswered question
      const firstUnansweredIndex = questions.findIndex(
        q => q.required && !responses[q.id]
      );
      
      if (firstUnansweredIndex >= 0) {
        setCurrentQuestionIndex(firstUnansweredIndex);
        return;
      }
    }
    
    try {
      setIsSubmitting(true);
      
      // Track submission attempt
      trackEvent('survey_submit_start', {
        survey_id: survey.id
      });
      
      // Submit the responses
      await onSubmit(responses);
      
      // Track successful submission
      trackEvent('survey_submit_complete', {
        survey_id: survey.id,
        question_count: questions.length
      });
      
      // Mark as completed
      setIsCompleted(true);
    } catch (error) {
      console.error('Error submitting survey:', error);
      
      // Track submission error
      trackEvent('survey_submit_error', {
        survey_id: survey.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [survey, questions, responses, onSubmit, trackEvent]);
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not in a text input or textarea
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }
      
      if (e.key === 'ArrowLeft' && currentQuestionIndex > 0) {
        handlePreviousClick();
      } else if (e.key === 'ArrowRight') {
        handleNextClick();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestionIndex, handlePreviousClick, handleNextClick]);
  
  // If the survey is completed, show completion message
  if (isCompleted) {
    return (
      <div className={cn('space-y-6 py-8 text-center', className)} data-testid="survey-completion">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-10 w-10 text-primary" data-testid="checkmark" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight" data-testid="completion-message">Thank You!</h2>
          <p className="text-muted-foreground">
            Your responses have been submitted successfully.
          </p>
        </div>
        <Button onClick={() => window.location.href = '/'} data-testid="home-button">
          Return Home
        </Button>
      </div>
    );
  }
  
  return (
    <div className={cn('space-y-6', className)} data-testid="survey-modal">
      {/* Survey header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">{survey.title}</h2>
        {survey.description && (
          <p className="text-muted-foreground">{survey.description}</p>
        )}
      </div>
      
      {/* Progress bar */}
      <div className="w-full">
        <SurveyProgressBar 
          value={progress} 
          steps={questions.length}
          currentStep={currentQuestionIndex + 1}
          data-testid="survey-progress"
        />
      </div>
      
      {/* Question container */}
      <div className="min-h-[200px]" data-testid="survey-form">
        {isCompleted ? (
          <div className="text-center py-8">
            <h3 className="text-xl font-medium mb-2">Thank you!</h3>
            <p className="text-muted-foreground">Your responses have been submitted.</p>
          </div>
        ) : (
          adaptedQuestion && (
            <div>
              <div data-testid="question-heading" className="mb-4">
                {adaptedQuestion.text}
                {adaptedQuestion.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </div>
              <QuestionRenderer
                question={adaptedQuestion}
                value={responses[currentQuestion.id]}
                onChange={handleResponseChange}
                showValidation={showValidation}
              />
              {showValidation && adaptedQuestion.required && !isCurrentQuestionValid() && (
                <p className="text-destructive mt-2" data-testid="validation-error">
                  This question is required
                </p>
              )}
            </div>
          )
        )}
      </div>
      
      {/* Navigation buttons */}
      {!isCompleted && (
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousClick}
            disabled={currentQuestionIndex === 0 || isSubmitting}
            className="flex items-center"
            data-testid="survey-prev-button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={handleNextClick}
            disabled={isSubmitting}
            className="flex items-center"
            data-testid={currentQuestionIndex < questions.length - 1 ? "survey-next-button" : "survey-submit-button"}
          >
            {currentQuestionIndex < questions.length - 1 ? (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              'Submit'
            )}
          </Button>
        </div>
      )}
    </div>
  );
} 