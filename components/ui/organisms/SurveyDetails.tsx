'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MilestoneEventDisplay } from './MilestoneEventDisplay';
import { useResearchTracking } from '@/hooks/use-research-tracking';

export interface SurveyDetailsProps {
  survey: any;
  responseCount?: number;
}

export function SurveyDetails({ survey, responseCount = 0 }: SurveyDetailsProps) {
  // Fix for the hydration issue by using client-side date formatting
  const [formattedDate, setFormattedDate] = useState<string>('');
  const { trackEvent } = useResearchTracking();
  
  useEffect(() => {
    // Format date on client to avoid hydration mismatch
    if (survey?.created_at) {
      try {
        const date = new Date(survey.created_at);
        setFormattedDate(date.toLocaleDateString());
      } catch (e) {
        setFormattedDate('Invalid date');
      }
    } else {
      setFormattedDate('N/A');
    }
    
    // Track survey view event
    trackEvent('survey_viewed', {
      details: { 
        survey_id: survey?.id,
        survey_name: survey?.name
      }
    });
  }, [survey, trackEvent]);
  
  if (!survey) {
    return null;
  }
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{survey.name || 'Untitled Survey'}</CardTitle>
            <CardDescription className="mt-1">
              {survey.status && (
                <Badge variant={survey.status === 'active' ? 'default' : 'secondary'}>
                  {survey.status}
                </Badge>
              )}
              <span className="ml-2">Created {formattedDate}</span>
              <span className="ml-2">{responseCount} responses</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {survey.description && (
            <div>
              <h3 className="text-sm font-medium">Description</h3>
              <p className="text-muted-foreground">{survey.description}</p>
            </div>
          )}
          
          <div>
            <h3 className="text-sm font-medium">Questions</h3>
            <div className="mt-2 space-y-3">
              {survey.config?.fields?.length > 0 ? (
                survey.config.fields.map((field: any, index: number) => (
                  <div key={index} className="border rounded-md p-3">
                    <p className="font-medium">
                      {index + 1}. {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </p>
                    <div className="flex items-center mt-1 text-xs text-muted-foreground">
                      <Badge variant="outline" className="mr-2">
                        {field.type}
                      </Badge>
                      {field.milestone && (
                        <Badge variant="secondary" className="mr-2">
                          {field.milestone}
                        </Badge>
                      )}
                    </div>
                    
                    {field.options && field.options.length > 0 && (
                      <div className="mt-2 pl-4">
                        <ul className="list-disc text-sm space-y-1">
                          {field.options.map((option: string, optIndex: number) => (
                            <li key={optIndex}>{option}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No questions</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 