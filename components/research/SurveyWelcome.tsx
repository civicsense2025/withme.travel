'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export interface SurveyWelcomeProps {
  title: string;
  description: string;
  onStart: () => void;
  /** Button label text (e.g., 'Start', 'Begin Session') */
  buttonText?: string;
  /** Test ID for the start button (default: 'survey-start-button') */
  buttonTestId?: string;
}

/**
 * Welcome screen shown before starting a survey
 *
 * E2E and accessibility requirements:
 * - Main heading must have role="heading", data-testid="survey-welcome-heading", and include "Welcome" in the text
 * - Start button must have data-testid="survey-start-button" and visible text "Start" or "Begin Session"
 * - Use <h1> for the main heading for a11y
 */
export function SurveyWelcome({ title, description, onStart, buttonText = 'Start', buttonTestId = 'survey-start-button' }: SurveyWelcomeProps) {
  return (
    <Card className="max-w-3xl mx-auto my-8">
      <CardHeader>
        <h1
          className="text-2xl md:text-3xl text-center"
          role="heading"
          aria-level={1}
          data-testid="survey-welcome-heading"
        >
          {title.includes('Welcome') ? title : `Welcome${title ? ': ' + title : ''}`}
        </h1>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground mb-6">{description}</p>
        
        <div className="space-y-4">
          <div className="border rounded-md p-4 bg-muted/20">
            <h3 className="text-lg font-medium mb-2">What to expect</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>This survey should take about 5-10 minutes to complete</li>
              <li>Your responses will help us improve our product</li>
              <li>All responses are anonymous unless you choose to provide contact information</li>
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button
          onClick={onStart}
          size="lg"
          data-testid={buttonTestId}
          aria-label={buttonText}
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}
