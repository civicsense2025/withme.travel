'use client';

import { useState } from 'react';
import { TripPreferenceForm } from '@/components/feedback/templates';
import { UserResponseSummary } from '@/components/feedback/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle, ClipboardList, BarChart } from 'lucide-react';
import {
  QuestionType,
  type Question,
  type Response,
  type ResponseSession,
} from '@/app/components/feedback/types';

interface TripFormsProps {
  tripId: string;
  tripName: string;
  destinationName?: string;
  members: { id: string; name: string; email?: string; avatar?: string }[];
  isAdmin: boolean;
  forms?: any[]; // This would be your actual form data type
  responses?: any[]; // This would be your actual response data type
}

export function TripForms({
  tripId,
  tripName,
  destinationName,
  members,
  isAdmin,
  forms = [],
  responses = [],
}: TripFormsProps) {
  const [activeTab, setActiveTab] = useState('available');
  const [showPreferenceForm, setShowPreferenceForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // This is a mockup function - in production you would save this to your API
  const handleSubmitPreferences = async (data: any) => {
    try {
      console.log('Form submitted:', data);
      // Here you would submit to your API
      setShowPreferenceForm(false);
      // After submission, you might want to refresh forms data
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrorMessage(
        error instanceof Error ? error.message : 'An error occurred submitting the form'
      );
    }
  };

  // Group forms by their type
  const availableForms = [
    {
      id: 'preferences',
      title: 'Trip Preferences',
      description: "Collect everyone's travel preferences to help with planning",
      icon: <ClipboardList className="h-5 w-5" />,
      responses: 0,
    },
    {
      id: 'accommodation',
      title: 'Accommodation Survey',
      description: 'Find out what type of place everyone wants to stay in',
      icon: <ClipboardList className="h-5 w-5" />,
      responses: 0,
    },
    {
      id: 'activities',
      title: 'Activity Interests',
      description: 'Discover which activities everyone wants to do',
      icon: <ClipboardList className="h-5 w-5" />,
      responses: 0,
    },
  ];

  const completedForms = [
    // This would be populated with forms that have responses
  ];

  // Fixed questions with proper type discrimination
  const mockQuestions: Question[] = [
    {
      id: 'q1',
      formId: 'preferences',
      title: 'What activities are you most interested in?',
      type: QuestionType.MULTIPLE_CHOICE,
      position: 0,
      isRequired: false,
      options: [
        { id: '1', label: 'Beaches', value: 'beaches' },
        { id: '2', label: 'Hiking', value: 'hiking' },
        { id: '3', label: 'Museums', value: 'museums' },
        { id: '4', label: 'Food Tours', value: 'food' },
        { id: '5', label: 'Nightlife', value: 'nightlife' },
      ],
      description: null,
      placeholder: null,
      metadata: {},
    },
    {
      id: 'q2',
      formId: 'preferences',
      title: "What's your budget comfort zone per day?",
      type: QuestionType.SLIDER_SCALE,
      position: 1,
      isRequired: false,
      minValue: 1,
      maxValue: 5,
      stepSize: 1,
      showValue: true,
      description: null,
      placeholder: null,
      metadata: {},
    },
  ];

  // Update mockResponses to match the expected Response type
  const mockResponses: Response[] = [
    {
      id: 'r1',
      questionId: 'q1',
      formId: 'preferences',
      value: ['beaches', 'food'],
      createdAt: new Date(),
    },
    {
      id: 'r2',
      questionId: 'q1',
      formId: 'preferences',
      value: ['hiking', 'museums'],
      createdAt: new Date(),
    },
    {
      id: 'r3',
      questionId: 'q1',
      formId: 'preferences',
      value: ['beaches', 'nightlife'],
      createdAt: new Date(),
    },
    {
      id: 'r4',
      questionId: 'q2',
      formId: 'preferences',
      value: 3,
      createdAt: new Date(),
    },
    {
      id: 'r5',
      questionId: 'q2',
      formId: 'preferences',
      value: 4,
      createdAt: new Date(),
    },
    {
      id: 'r6',
      questionId: 'q2',
      formId: 'preferences',
      value: 2,
      createdAt: new Date(),
    },
  ];

  // Update mockSessions to match the expected ResponseSession type
  const mockSessions: ResponseSession[] = [
    {
      id: 's1',
      formId: 'preferences',
      startedAt: new Date(),
      completedAt: new Date(),
      respondentId: 'u1',
    },
    {
      id: 's2',
      formId: 'preferences',
      startedAt: new Date(),
      completedAt: new Date(),
      respondentId: 'u2',
    },
    {
      id: 's3',
      formId: 'preferences',
      startedAt: new Date(),
      completedAt: new Date(),
      respondentId: 'u3',
    },
  ];

  // Check if we have valid data for rendering summary
  const canRenderSummary =
    mockQuestions.length > 0 && mockResponses.length > 0 && mockSessions.length > 0;

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4">
          <p className="font-medium">{errorMessage}</p>
          <Button variant="ghost" size="sm" onClick={() => setErrorMessage(null)} className="mt-2">
            Dismiss
          </Button>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Forms</h2>
          <TabsList>
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedForms.length})</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="available" className="space-y-4">
          {showPreferenceForm ? (
            <Card>
              <CardHeader>
                <CardTitle>Trip Preferences</CardTitle>
                <CardDescription>
                  Help us plan the perfect trip by sharing what matters to you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TripPreferenceForm
                  tripId={tripId}
                  tripName={tripName}
                  destinationName={destinationName}
                  onSubmit={handleSubmitPreferences}
                  onComplete={() => setShowPreferenceForm(false)}
                />
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableForms.map((form) => (
                  <Card key={form.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="rounded-full bg-primary/10 p-2">{form.icon}</div>
                        {form.responses > 0 && (
                          <span className="text-xs bg-muted px-2 py-1 rounded-full">
                            {form.responses} responses
                          </span>
                        )}
                      </div>
                      <CardTitle className="mt-2">{form.title}</CardTitle>
                      <CardDescription>{form.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        className="w-full"
                        onClick={() => {
                          if (form.id === 'preferences') {
                            setShowPreferenceForm(true);
                          }
                        }}
                      >
                        Open Form
                      </Button>
                    </CardContent>
                  </Card>
                ))}

                {isAdmin && (
                  <Card className="border-dashed hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer bg-muted/50">
                    <CardHeader className="pb-2">
                      <div className="rounded-full bg-primary/10 p-2 w-min">
                        <PlusCircle className="h-5 w-5" />
                      </div>
                      <CardTitle className="mt-2">Create Custom Form</CardTitle>
                      <CardDescription>
                        Build a form from scratch for specific needs
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full">
                        Create New
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedForms.length > 0 ? (
            <div className="space-y-8">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Trip Preferences</CardTitle>
                      <CardDescription>
                        {mockSessions.length} of {members.length} members responded
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <BarChart className="h-4 w-4" />
                      Full Analysis
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {canRenderSummary ? (
                    <UserResponseSummary
                      tripId={tripId}
                      tripName={tripName}
                      formTitle="Trip Preferences"
                      questions={mockQuestions}
                      responses={mockResponses}
                      sessions={mockSessions}
                      memberCount={members.length}
                    />
                  ) : (
                    <div className="text-center p-6 text-muted-foreground">
                      Unable to load response summary data. Please try again later.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto flex items-center justify-center mb-4">
                <ClipboardList className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium">No forms completed yet</h3>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                When you and your group complete forms, they'll appear here with results and
                insights.
              </p>
              <Button
                className="mt-6"
                onClick={() => {
                  setActiveTab('available');
                  setShowPreferenceForm(true);
                }}
              >
                Fill Out a Form
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
