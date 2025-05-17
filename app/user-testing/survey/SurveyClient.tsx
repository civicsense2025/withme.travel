'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { SurveyContainer, Survey, SurveyField } from '@/components/research/SurveyContainer';
import { ResearchProvider } from '@/components/research/ResearchProvider';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ResearchModal } from '@/components/research/ResearchModal';
import { SurveyDebugView } from './SurveyDebugView';
import { FORM_TYPES } from '@/utils/constants/research-tables';
import type { Form, FormType, FormField } from '@/types/research';

// Extended Form type for our internal use that includes milestones
interface SurveyForm extends Form {
  milestones?: string[];
}

// For API fetching
async function fetchWithErrorHandling<T>(url: string): Promise<T> {
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.message || response.statusText || 'Failed to fetch data';
    throw new Error(errorMessage);
  }
  
  return await response.json();
}

// Declare the debug state on the window object for E2E tests
declare global {
  interface Window {
    surveyDebugState?: {
      surveyData: Form | null;
      token: string | null;
      loading: boolean;
      error: string | null;
      isFormSubmitted: boolean;
    };
  }
}

// Helper function to convert a Form to a Survey
function formToSurvey(form: SurveyForm): Survey {
  // Extract milestones - this might be in config or as a custom property
  const formMilestones = Array.isArray(form.milestones) 
    ? form.milestones 
    : form.config?.milestones 
      ? form.config.milestones 
      : ['default'];
  
  console.log('FormToSurvey - Input form:', {
    id: form.id,
    hasMilestones: Array.isArray(form.milestones) || Array.isArray(form.config?.milestones),
    milestones: formMilestones,
    fieldCount: Array.isArray(form.fields) ? form.fields.length : 0
  });

  // Convert form fields to survey fields
  const surveyFields: SurveyField[] = (form.fields || []).map(field => {
    // Make sure each field has a milestone, defaulting to the first milestone if missing
    const fieldMilestone = (field as any).milestone || formMilestones[0];
    
    return {
      id: field.id || '',
      milestone: fieldMilestone,
      label: field.label || field.name || '', // Ensure label is not undefined
      type: field.type || 'text', // Ensure type is not undefined
      options: field.config?.options || [],
      required: !!field.required
    };
  });

  // Group fields by milestone to ensure they're organized correctly
  const fieldsByMilestone: Record<string, SurveyField[]> = {};
  
  // Initialize each milestone with an empty array
  formMilestones.forEach((milestone: string) => {
    fieldsByMilestone[milestone] = [];
  });
  
  // Group fields by their milestone
  surveyFields.forEach(field => {
    if (field.milestone && formMilestones.includes(field.milestone)) {
      fieldsByMilestone[field.milestone].push(field);
    } else {
      // If milestone is invalid, assign to first milestone
      fieldsByMilestone[formMilestones[0]].push({
        ...field,
        milestone: formMilestones[0]
      });
    }
  });
  
  // Flatten the fields back into a single array, preserving milestone ordering
  const organizedFields = formMilestones.flatMap((milestone: string) => fieldsByMilestone[milestone]);

  // Create a proper Survey object
  return {
    id: form.id || '',
    name: form.name || 'Survey',
    description: form.description || '',
    type: form.type,
    is_active: form.is_active !== false,
    created_at: form.created_at || new Date().toISOString(),
    milestones: formMilestones,
    fields: organizedFields
  } as Survey;
}

export default function SurveyClient() {
  const searchParams = useSearchParams();
  // Support both URL formats: ?formId=123 and /:id
  const formId = searchParams?.get('formId') || (typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : null);
  const [form, setForm] = useState<SurveyForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);

  useEffect(() => {
    if (!formId) {
      setError('No survey form specified.');
      setLoading(false);
      return;
    }
    // Fetch survey form directly from /api/forms/[id]
    const fetchForm = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/forms/${formId}`);
        if (!response.ok) throw new Error('Failed to fetch survey form');
        const data = await response.json();
        setForm(data.form || null);
      } catch (err) {
        setError('Failed to load survey form');
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [formId]);

  const handleSubmit = async (formData: any) => {
    try {
      // Add detailed logging for debugging form submissions
      if (process.env.NODE_ENV !== 'production') {
        // Use a safe stringify to avoid [object Object] issues
        const safeReplacer = (key: string, value: any) => {
          if (value === null) return 'null';
          if (value === undefined) return 'undefined';
          if (typeof value === 'function') return `[Function: ${value.name || 'anonymous'}]`;
          return value;
        };
        
        console.log('Submitting form data:', 
          JSON.stringify(formData, safeReplacer, 2)
        );
      }
      
      // Submit the form data
      const response = await fetch('/api/research/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId, // Include the form ID
          formData
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit survey');
      }
      
      setIsSubmitted(true);
      
      // Update debug state
      if (process.env.NODE_ENV !== 'production') {
        window.surveyDebugState = {
          ...window.surveyDebugState!,
          isFormSubmitted: true
        };
      }
      
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit survey');
    }
  };

  try {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Spinner size="lg" />
          <span className="ml-2">Loading your survey...</span>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex items-center justify-center min-h-screen p-4" data-testid="error-container">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-center text-red-500" data-testid="error-title">Error</CardTitle>
              <CardDescription className="text-center" data-testid="error-message">
                {error}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={() => window.location.href = '/'} data-testid="return-home-button">
                Return Home
              </Button>
            </CardContent>
          </Card>
          {/* Add debug view even for error state */}
          <SurveyDebugView
            survey={form}
            isSubmitted={isSubmitted}
            error={error}
          />
        </div>
      );
    }
    if (!formId) {
      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-center" data-testid="no-form-title">No Survey Selected</CardTitle>
              <CardDescription className="text-center" data-testid="no-form-message">
                No survey form was specified in the URL.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={() => window.location.href = '/'} data-testid="no-form-home-button">
                Return Home
              </Button>
            </CardContent>
          </Card>
          {/* Add debug view */}
          <SurveyDebugView
            survey={form}
            isSubmitted={isSubmitted}
            error={error}
          />
        </div>
      );
    }
    // Handle null form case
    if (!form) {
      return <div>No survey data available.</div>;
    }
    // Convert Form to Survey type for SurveyContainer
    const survey = formToSurvey(form as SurveyForm);
    return (
      <ResearchProvider>
        <div className="container mx-auto py-8 px-4 max-w-3xl">
          <Card>
            <CardContent className="pt-6">
              <SurveyContainer
                survey={survey}
                onComplete={() => {
                  handleSubmit(survey);
                  setIsSubmitted(true);
                }}
              />
            </CardContent>
          </Card>
        </div>
        {/* Add debug view in non-production environments */}
        <SurveyDebugView
          survey={form}
          isSubmitted={isSubmitted}
          error={error}
        />
        <ResearchModal />
      </ResearchProvider>
    );
  } catch (err: any) {
    // Catch render errors and show details
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center text-red-500">Render Error</CardTitle>
            <CardDescription className="text-center">
              {err.message || String(err)}
              {err.stack && (
                <pre className="bg-muted p-2 rounded text-xs overflow-x-auto mt-2">{err.stack}</pre>
              )}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
} 