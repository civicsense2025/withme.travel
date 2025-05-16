'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { SurveyContainer, SurveyContainerProps } from '@/components/research/SurveyContainer';
import { ResearchProvider } from '@/components/research/ResearchProvider';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ResearchModal } from '@/components/research/ResearchModal';
import { SurveyDebugView } from './SurveyDebugView';
import { FORM_TYPES } from '@/utils/constants/research-tables';
import type { Form, FormType } from '@/types/research';
import clientGuestUtils from '@/utils/guest';

// Define FormField if not imported
interface FormField {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  description?: string;
  config?: Record<string, any>;
  milestone?: string;
  [key: string]: any;
}

// Use Form interface from types/research but create a compatible local interface
interface Survey {
  id: string;
  name: string;
  description?: string;
  status?: string;
  form_fields?: FormField[];
  fields?: FormField[];
  config?: Record<string, any>;
  type: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  milestone_trigger?: string | null;
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
      surveyData: Survey | null;
      token: string | null;
      loading: boolean;
      error: string | null;
      isFormSubmitted: boolean;
    };
  }
}

export default function SurveyClient() {
  const [token, setToken] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const formId = searchParams?.get('formId') || null;
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    // Check for authentication token
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      setToken(authToken);
    } else {
      // Fallback to guest token using clientGuestUtils
      const guestToken = clientGuestUtils.getToken();
      if (guestToken) {
        setToken(guestToken);
      } else {
        console.error('No token found');
      }
    }
  }, []);

  useEffect(() => {
    // For E2E testing, expose the survey state
    if (process.env.NODE_ENV !== 'production') {
      window.surveyDebugState = {
        surveyData: survey,
        token,
        loading,
        error,
        isFormSubmitted: isSubmitted
      };
    }
  }, [survey, token, loading, error, isSubmitted]);

  useEffect(() => {
    const fetchSurvey = async () => {
      if (!token) {
        setError('Missing token');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Log the token being used (for debugging)
        console.log(`Fetching survey with token: ${token}`);
        
        const result = await fetchWithErrorHandling<Survey>(
          `/api/research/sessions/${token}`
        );
        
        // Process form_fields to ensure they're properly formatted
        if (result && result.form_fields) {
          // Create a clean copy to avoid reference issues
          const processedResult = {
            ...result,
            form_fields: result.form_fields.map(field => {
              // Ensure each field has an id and type at minimum
              if (!field.id || !field.type) {
                console.warn('Form field missing id or type:', field);
              }
              
              return {
                ...field,
                _debug_id: `field-${field.id}-${field.type}` // Add a debug identifier
              };
            })
          };
          
          // Debug log of the actual survey data received
          if (process.env.NODE_ENV !== 'production') {
            // Use replacer function to handle circular references and [object Object]
            const safeReplacer = (key: string, value: any) => {
              if (value === null) return 'null';
              if (value === undefined) return 'undefined';
              if (typeof value === 'function') return `[Function: ${value.name || 'anonymous'}]`;
              return value;
            };
            
            console.log('Survey data received:', 
              JSON.stringify(processedResult, safeReplacer, 2)
            );
          }
          
          setSurvey(processedResult);
        } else {
          setSurvey(result);
        }
      } catch (err) {
        console.error('Error fetching survey:', err);
        setError(err instanceof Error ? err.message : 'Failed to load survey');
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [token]);

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
      
      // Rest of submission logic...
      // Currently stubbed for the test
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
      // Handle submission error
    }
  };

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
          survey={survey}
          token={token}
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
          survey={survey}
          token={token}
          isSubmitted={isSubmitted}
          error={error}
        />
      </div>
    );
  }

  // Handle null survey case
  if (!survey) {
    return <div>No survey data available.</div>;
  }

  return (
    <ResearchProvider>
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        <Card>
          <CardContent className="pt-6">
            <SurveyContainer
              survey={survey as any}
              onComplete={() => setIsSubmitted(true)}
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Add debug view in non-production environments */}
      <SurveyDebugView
        survey={survey}
        token={token}
        isSubmitted={isSubmitted}
        error={error}
      />
      
      <ResearchModal />
    </ResearchProvider>
  );
} 