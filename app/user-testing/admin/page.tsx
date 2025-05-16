'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Survey } from '@/components/research/SurveyContainer';
import { PRODUCT_EXPERIENCE_SURVEY, FEATURE_FEEDBACK_SURVEY, USER_DEMOGRAPHIC_SURVEY } from '@/components/research/SampleSurveys';
import { ExportSurveyResults } from '@/components/research/ExportSurveyResults';
import { SurveyHeatmap, QuestionMetric } from '@/components/research/SurveyHeatmap';

/**
 * Admin interface for research surveys management
 */
export default function ResearchAdmin() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>('');
  const { toast } = useToast();
  
  // Load sample surveys for now
  useEffect(() => {
    // This would typically fetch from an API
    const sampleSurveys = [
      PRODUCT_EXPERIENCE_SURVEY,
      FEATURE_FEEDBACK_SURVEY,
      USER_DEMOGRAPHIC_SURVEY
    ];
    
    setSurveys(sampleSurveys);
    setSelectedSurveyId(sampleSurveys[0].id);
    
    // Sample sessions with mock responses
    const sampleSessions = [
      {
        id: 'session-1',
        surveyId: PRODUCT_EXPERIENCE_SURVEY.id,
        startedAt: new Date(Date.now() - 86400000).toISOString(),
        completedAt: new Date(Date.now() - 80000000).toISOString(),
        completedMilestones: ['onboarding', 'trip_planning', 'feedback'],
        responseCount: 12,
        responses: [
          { fieldId: 'question-1', value: 'Social Media' },
          { fieldId: 'question-2', value: 'Very Easy' },
          { fieldId: 'question-3', value: 'Excellent' },
          { fieldId: 'question-4', value: 'Destination research' },
          { fieldId: 'question-5', value: 'Weekly' },
          { fieldId: 'question-6', value: 4 },
          { fieldId: 'question-7', value: true },
          { fieldId: 'question-8', value: 'Design and ease of use' },
          { fieldId: 'question-9', value: 5 },
          { fieldId: 'question-10', value: 'Absolutely!' },
          { fieldId: 'question-11', value: 'Collaborative planning is a game changer' },
          { fieldId: 'question-12', value: 'More destination guides' }
        ]
      },
      {
        id: 'session-2',
        surveyId: FEATURE_FEEDBACK_SURVEY.id,
        startedAt: new Date(Date.now() - 43200000).toISOString(),
        completedMilestones: ['discovery', 'usage'],
        responseCount: 7,
        responses: [
          { fieldId: 'feature-1', value: 'Group chat' },
          { fieldId: 'feature-2', value: 'Somewhat important' },
          { fieldId: 'feature-3', value: 3 },
          { fieldId: 'feature-4', value: 'Mobile app' },
          { fieldId: 'feature-5', value: 'Itinerary view' },
          { fieldId: 'feature-6', value: true },
          { fieldId: 'feature-7', value: 'Sometimes confusing to navigate' }
        ]
      },
      {
        id: 'session-3',
        surveyId: USER_DEMOGRAPHIC_SURVEY.id,
        startedAt: new Date(Date.now() - 21600000).toISOString(),
        completedAt: new Date(Date.now() - 20000000).toISOString(),
        completedMilestones: ['personal', 'travel_habits'],
        responseCount: 8,
        responses: [
          { fieldId: 'demographic-1', value: '25-34' },
          { fieldId: 'demographic-2', value: 'Female' },
          { fieldId: 'demographic-3', value: 'United States' },
          { fieldId: 'demographic-4', value: 'Urban' },
          { fieldId: 'demographic-5', value: '2-3 times per year' },
          { fieldId: 'demographic-6', value: 'Friends' },
          { fieldId: 'demographic-7', value: 'Adventure travel' },
          { fieldId: 'demographic-8', value: 'Smartphone' }
        ]
      }
    ];
    
    setSessions(sampleSessions);
    setIsLoading(false);
  }, []);
  
  // Sample metrics for the heatmap visualization
  const generateSampleMetrics = (surveyId: string): QuestionMetric[] => {
    const survey = surveys.find(s => s.id === surveyId);
    if (!survey) return [];
    
    return survey.fields.map(field => {
      // Generate semi-random metrics for demonstration
      const randomFactor = Math.random();
      const isComplexQuestion = field.type === 'textarea' || field.label.length > 30;
      
      return {
        fieldId: field.id,
        // Longer time for complex questions
        avgTimeSpent: Math.round((isComplexQuestion ? 30 : 15) * (0.5 + randomFactor)),
        // Lower completion for complex questions
        completionRate: Math.min(1, 0.7 + (isComplexQuestion ? 0.1 : 0.3) * randomFactor),
        // Higher dropoff for complex questions
        dropoffRate: Math.min(0.5, (isComplexQuestion ? 0.2 : 0.05) * (1 + randomFactor)),
        // Higher change rate for complex questions
        changeRate: Math.min(0.6, (isComplexQuestion ? 0.3 : 0.1) * (1 + randomFactor))
      };
    });
  };
  
  const handleCreateLink = (surveyId: string) => {
    // Generate a random token
    const token = Math.random().toString(36).substring(2, 15);
    const url = `${window.location.origin}/user-testing/survey/${token}?type=${surveyId}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(url);
    
    toast({
      title: 'Survey link created!',
      description: 'The link has been copied to your clipboard.',
    });
  };
  
  const selectedSurvey = surveys.find(s => s.id === selectedSurveyId);
  const sampleMetrics = selectedSurvey ? generateSampleMetrics(selectedSurveyId) : [];
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Research Surveys Management</h1>
      
      <Tabs defaultValue="surveys">
        <TabsList className="mb-4">
          <TabsTrigger value="surveys">Surveys</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="heatmap">Response Heatmap</TabsTrigger>
        </TabsList>
        
        <TabsContent value="surveys">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {surveys.map((survey) => (
              <Card key={survey.id}>
                <CardHeader>
                  <CardTitle>{survey.name}</CardTitle>
                  <CardDescription>{survey.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground mb-2">
                    <strong>Milestones:</strong> {survey.milestones.join(', ')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <strong>Questions:</strong> {survey.fields.length}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      // Would open an editor in a full implementation
                      toast({
                        title: 'Edit functionality',
                        description: 'Survey editing would be implemented here.',
                      });
                    }}
                  >
                    Edit
                  </Button>
                  <Button onClick={() => handleCreateLink(survey.id)}>
                    Create Link
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
            {/* Add new survey card */}
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-muted-foreground">Create New Survey</CardTitle>
                <CardDescription>Design a new research survey</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center py-8">
                <Button 
                  variant="ghost" 
                  size="lg" 
                  className="w-16 h-16 rounded-full text-3xl"
                  onClick={() => {
                    toast({
                      title: 'Survey creation',
                      description: 'Survey creation tool would be implemented here.',
                    });
                  }}
                >
                  +
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="sessions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Survey Sessions</CardTitle>
                <CardDescription>Recent survey sessions and responses</CardDescription>
              </div>
              
              {/* Export functionality */}
              <ExportSurveyResults 
                surveyId="all" 
                sessions={sessions}
              />
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted">
                    <tr>
                      <th className="px-6 py-3">Session ID</th>
                      <th className="px-6 py-3">Survey</th>
                      <th className="px-6 py-3">Started</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Responses</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session) => {
                      const survey = surveys.find(s => s.id === session.surveyId);
                      return (
                        <tr key={session.id} className="bg-white border-b">
                          <td className="px-6 py-4">{session.id}</td>
                          <td className="px-6 py-4">{survey?.name || session.surveyId}</td>
                          <td className="px-6 py-4">
                            {new Date(session.startedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            {session.completedAt ? 'Completed' : 'In Progress'}
                          </td>
                          <td className="px-6 py-4">{session.responseCount}</td>
                          <td className="px-6 py-4 flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                toast({
                                  title: 'View Responses',
                                  description: 'Response viewer would be implemented here.',
                                });
                              }}
                            >
                              View
                            </Button>
                            
                            <ExportSurveyResults 
                              surveyId={session.surveyId}
                              sessions={[session]}
                              survey={surveys.find(s => s.id === session.surveyId)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Research Statistics</CardTitle>
                <CardDescription>Overview of survey participation and completion rates</CardDescription>
              </div>
              
              <ExportSurveyResults 
                surveyId="stats" 
                sessions={sessions}
              />
            </CardHeader>
            <CardContent>
              {/* Stats would be implemented here with charts */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 border rounded-lg">
                  <div className="text-2xl font-bold">{sessions.length}</div>
                  <div className="text-sm text-muted-foreground">Total Sessions</div>
                </div>
                
                <div className="p-6 border rounded-lg">
                  <div className="text-2xl font-bold">
                    {sessions.filter(s => s.completedAt).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed Surveys</div>
                </div>
                
                <div className="p-6 border rounded-lg">
                  <div className="text-2xl font-bold">
                    {Math.round(sessions.filter(s => s.completedAt).length / sessions.length * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Completion Rate</div>
                </div>
              </div>
              
              <div className="mt-8">
                <div className="text-lg font-semibold mb-4">Milestone Completion</div>
                
                {surveys.map(survey => {
                  const surveySessions = sessions.filter(s => s.surveyId === survey.id);
                  if (surveySessions.length === 0) return null;
                  
                  return (
                    <div key={survey.id} className="mb-6">
                      <div className="text-md font-medium mb-2">{survey.name}</div>
                      <div className="space-y-2">
                        {survey.milestones.map(milestone => {
                          const completionCount = surveySessions.filter(
                            s => s.completedMilestones.includes(milestone)
                          ).length;
                          const completionRate = Math.round(
                            (completionCount / surveySessions.length) * 100
                          );
                          
                          return (
                            <div key={milestone} className="flex items-center">
                              <div className="w-40 text-sm">{milestone}</div>
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary" 
                                  style={{ width: `${completionRate}%` }}
                                ></div>
                              </div>
                              <div className="w-12 text-right text-sm">{completionRate}%</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="heatmap">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <label htmlFor="survey-select" className="text-sm font-medium">Select Survey:</label>
              </div>
              <div className="w-96">
                <Select 
                  value={selectedSurveyId} 
                  onValueChange={setSelectedSurveyId}
                >
                  <SelectTrigger id="survey-select">
                    <SelectValue placeholder="Select a survey" />
                  </SelectTrigger>
                  <SelectContent>
                    {surveys.map(survey => (
                      <SelectItem key={survey.id} value={survey.id}>
                        {survey.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-shrink-0">
                <ExportSurveyResults 
                  surveyId={selectedSurveyId}
                  sessions={sessions.filter(s => s.surveyId === selectedSurveyId)}
                  survey={selectedSurvey}
                />
              </div>
            </div>
            
            {selectedSurvey ? (
              <SurveyHeatmap 
                survey={selectedSurvey}
                metrics={sampleMetrics}
              />
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                Select a survey to view the heatmap
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 