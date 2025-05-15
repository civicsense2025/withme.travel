// ============================================================================
// SURVEY CONTAINER: Multi-step, milestone-aware survey flow
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Form, FormField } from '@/components/ui/form';
import { QuestionRenderer } from './QuestionRenderer';
import { useResearch } from './ResearchProvider';
import { Form as FormType, FormField as FormFieldType } from '@/types';
import { RESEARCH_EVENT_TYPES } from '@/types';
import { Progress } from '@/components/ui/progress';
import { SurveyWelcome } from './SurveyWelcome';

/**
 * Props for the SurveyContainer component
 */
export interface SurveyContainerProps {
  /** Form ID to display */
  formId: string;
  /** Optional milestone for multi-step forms */
  milestone?: string;
  /** Session ID for tracking */
  sessionId: string;
  /** Session token for authentication */
  sessionToken: string;
  /** Display mode (modal or page) */
  mode: 'modal' | 'page';
  /** Callback when survey is closed */
  onClose: () => void;
}

/**
 * Survey states
 */
type SurveyState = 'loading' | 'welcome' | 'questions' | 'complete' | 'error';

/**
 * Container component that handles survey loading, navigation and submission
 */
export function SurveyContainer({
  formId,
  milestone,
  sessionId,
  sessionToken,
  mode,
  onClose,
}: SurveyContainerProps) {
  const { toast } = useToast();
  const { trackEvent } = useResearch();
  const [surveyState, setSurveyState] = useState<SurveyState>('loading');
  const [form, setForm] = useState<FormType | null>(null);
  const [fields, setFields] = useState<FormFieldType[]>([]);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load form and fields
  useEffect(() => {
    async function loadFormData() {
      try {
        // Load form
        const formResponse = await fetch(`/api/research/forms/${formId}`);
        if (!formResponse.ok) {
          throw new Error('Failed to load survey');
        }
        const formData = await formResponse.json();
        setForm(formData);

        // Load fields
        const fieldsResponse = await fetch(`/api/research/forms/${formId}/fields`);
        if (!fieldsResponse.ok) {
          throw new Error('Failed to load survey questions');
        }
        const fieldsData = await fieldsResponse.json();
        
        // Filter fields by milestone if provided
        const filteredFields = milestone 
          ? fieldsData.filter((field: FormFieldType) => field.milestone === milestone)
          : fieldsData;
        
        // Sort fields by order
        const sortedFields = filteredFields.sort((a: FormFieldType, b: FormFieldType) => 
          (a.order || 0) - (b.order || 0)
        );
        
        setFields(sortedFields);
        setSurveyState('welcome');
        
        // Track survey started event
        trackEvent(RESEARCH_EVENT_TYPES.SURVEY_STARTED, { 
          form_id: formId, 
          milestone,
          field_count: sortedFields.length
        });
      } catch (err) {
        console.error('Error loading survey:', err);
        setSurveyState('error');
        setError(err instanceof Error ? err.message : 'Failed to load survey');
      }
    }

    loadFormData();
  }, [formId, milestone, trackEvent]);

  // Calculate progress
  useEffect(() => {
    if (surveyState === 'welcome') {
      setProgress(0);
    } else if (surveyState === 'questions' && fields.length > 0) {
      setProgress(Math.floor((currentFieldIndex / fields.length) * 100));
    } else if (surveyState === 'complete') {
      setProgress(100);
    }
  }, [surveyState, currentFieldIndex, fields.length]);

  // Start the survey
  const handleStart = () => {
    setSurveyState('questions');
    setCurrentFieldIndex(0);
  };

  // Handle field response
  const handleFieldChange = (fieldId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  // Navigate to the next question
  const handleNext = () => {
    // Track step completion
    trackEvent(RESEARCH_EVENT_TYPES.SURVEY_STEP_COMPLETED, {
      form_id: formId,
      milestone,
      field_id: fields[currentFieldIndex].id,
      progress: progress
    });

    // If this is the last question, submit
    if (currentFieldIndex === fields.length - 1) {
      handleSubmit();
    } else {
      // Otherwise, go to the next question
      setCurrentFieldIndex(prev => prev + 1);
    }
  };

  // Navigate to the previous question
  const handlePrevious = () => {
    setCurrentFieldIndex(prev => Math.max(0, prev - 1));
  };

  // Submit the survey
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Submit the response
      const response = await fetch('/api/research/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          form_id: formId,
          session_id: sessionId,
          responses,
          milestone,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit survey');
      }

      // Track survey completion
      trackEvent(RESEARCH_EVENT_TYPES.SURVEY_COMPLETED, {
        form_id: formId,
        milestone,
        response_count: Object.keys(responses).length
      });

      // Show success and move to completion state
      toast({
        title: 'Survey submitted',
        description: 'Thank you for your feedback!',
      });
      setSurveyState('complete');
    } catch (err) {
      console.error('Error submitting survey:', err);
      toast({
        title: 'Error',
        description: 'Failed to submit your response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get current field
  const currentField = fields[currentFieldIndex];

  // Render based on state
  if (surveyState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[300px]">
        <Spinner size="lg" />
        <p className="mt-4 text-center text-muted-foreground">Loading survey...</p>
      </div>
    );
  }

  if (surveyState === 'error') {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[300px]">
        <div className="text-destructive text-4xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
        <p className="text-center text-muted-foreground mb-4">{error || 'Failed to load the survey'}</p>
        <Button onClick={onClose} variant="outline">Close</Button>
      </div>
    );
  }

  if (surveyState === 'welcome' && form) {
    // Use the shared SurveyWelcome component for E2E and a11y consistency
    // Pass buttonText and buttonTestId for E2E selectors
    // Multi-milestone: config.milestones is an array with >1 item
    const isMultiMilestone = Array.isArray(form.config?.milestones) && form.config.milestones.length > 1;
    const buttonText = form.config?.button_text?.start || (isMultiMilestone ? 'Begin Session' : 'Start');
    const buttonTestId = 'survey-start-button';
    return (
      <SurveyWelcome
        title={form.name || 'Welcome'}
        description={form.description || ''}
        onStart={handleStart}
        buttonText={buttonText}
        buttonTestId={buttonTestId}
      />
    );
  }

  if (surveyState === 'questions' && currentField) {
    return (
      <div className="flex flex-col p-4">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-1">
            <span>Question {currentFieldIndex + 1} of {fields.length}</span>
            <span>{progress}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        <div className="mb-8">
          <QuestionRenderer
            field={currentField}
            value={responses[currentField.id]}
            onChange={(value) => handleFieldChange(currentField.id, value)}
          />
        </div>

        {/* Navigation buttons with test IDs for E2E */}
        <div className="flex justify-between mt-4">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentFieldIndex === 0}
            data-testid="survey-prev-button"
          >
            Previous
          </Button>
          <Button 
            onClick={handleNext}
            disabled={
              currentField.required && 
              (responses[currentField.id] === undefined || responses[currentField.id] === null || responses[currentField.id] === '')
            }
            data-testid={currentFieldIndex === fields.length - 1 ? 'survey-submit-button' : 'survey-next-button'}
          >
            {currentFieldIndex === fields.length - 1 ? 'Submit' : 'Next'}
          </Button>
        </div>
      </div>
    );
  }

  if (surveyState === 'complete') {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[300px]">
        <div className="text-primary text-4xl mb-4">✓</div>
        <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
        <p className="text-center text-muted-foreground mb-6">Your feedback has been submitted successfully.</p>
        <Button onClick={onClose}>Close</Button>
      </div>
    );
  }

  // Defensive: log and show error if form or session is missing
  if ((surveyState === 'welcome' || surveyState === 'questions') && !form) {
    console.error('SurveyContainer: form is null for formId', formId);
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[300px]">
        <div className="text-destructive text-4xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold mb-2">Survey Not Found</h3>
        <p className="text-center text-muted-foreground mb-4">The requested survey could not be loaded. Please try again later.</p>
        <Button onClick={onClose} variant="outline">Close</Button>
      </div>
    );
  }

  // Fallback
  return null;
}
