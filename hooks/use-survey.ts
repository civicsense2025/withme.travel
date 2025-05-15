/**
 * Hook for working with forms and surveys
 */
import { useCallback, useState, useEffect } from 'react';
import { FORM_FIELD_TYPES } from '@/utils/constants/research-tables';

export interface FormField {
  id: string;
  label: string;
  name: string;
  type: string;
  options?: { label: string; value: string }[];
  required?: boolean;
  order?: number;
  milestone?: string | null;
  config?: {
    placeholder?: string;
    [key: string]: any;
  };
  description?: string;
}

export interface Form {
  id: string;
  name: string;
  description?: string;
  type: string;
  is_active: boolean;
  config?: {
    fields: FormField[];
    [key: string]: any;
  };
  milestone_trigger?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface FormResponse {
  [fieldId: string]: any;
}

/**
 * Hook for fetching and submitting forms
 */
export function useSurvey(formId?: string) {
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /**
   * Fetch a form by ID
   */
  const fetchForm = useCallback(async () => {
    if (!formId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/research/forms/${formId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch form: ${response.statusText}`);
      }
      
      const data = await response.json();
      setForm(data);
    } catch (err) {
      console.error('Error fetching form:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [formId]);

  /**
   * Submit form responses
   */
  const submitFormResponse = useCallback(async (
    formId: string, 
    responses: FormResponse,
    sessionId?: string
  ) => {
    setSubmitting(true);
    setError(null);
    
    try {
      const userAgentData = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
      };
      
      const response = await fetch(`/api/research/forms/${formId}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          form_id: formId,
          session_id: sessionId,
          responses,
          device_info: userAgentData,
          created_at: new Date().toISOString(),
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to submit form: ${response.statusText}`);
      }
      
      setSubmitted(true);
      return await response.json();
    } catch (err) {
      console.error('Error submitting form response:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, []);

  /**
   * Track research events
   */
  const trackEvent = useCallback(async (
    eventType: string,
    eventData: Record<string, any> = {},
    sessionId?: string
  ) => {
    try {
      if (!eventType) {
        console.error('trackEvent called without event type');
        return;
      }

      const eventPayload = {
        event_type: eventType,
        session_id: sessionId,
        details: eventData,
        route: window.location.pathname,
        timestamp: new Date().toISOString(),
      };

      console.log('Tracking event:', eventPayload);

      const response = await fetch('/api/research/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventPayload),
      });
      
      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({
          error: response.statusText
        }));
        
        const errorMsg = errorJson.error || response.statusText;
        console.error('Failed to track event:', errorMsg, errorJson.details || '');
        throw new Error(errorMsg);
      }

      return await response.json();
    } catch (err) {
      console.error('Error tracking event:', err);
      // Don't throw this error to prevent it from breaking the UI
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }, []);

  // Fetch form on mount if formId is provided
  useEffect(() => {
    if (formId) {
      fetchForm();
    }
  }, [formId, fetchForm]);

  return {
    form,
    loading,
    error,
    submitting,
    submitted,
    fetchForm,
    submitFormResponse,
    trackEvent,
  };
} 