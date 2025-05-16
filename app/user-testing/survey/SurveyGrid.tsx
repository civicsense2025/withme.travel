'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import clientGuestUtils from '@/utils/guest';

export interface Survey {
  id: string;
  name: string;
  description: string;
  progress: number;
  milestones: string[];
  currentMilestone: string;
}

interface SurveyGridProps {
  surveys: Survey[];
  className?: string;
}

export function SurveyGrid({ surveys, className = '' }: SurveyGridProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popularity' | 'name' | 'progress'>('popularity');

  // Sort surveys based on selected option
  const sortedSurveys = [...surveys].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'progress':
        return b.progress - a.progress;
      case 'popularity':
      default:
        // For popularity, we could implement a more complex sorting logic 
        // based on how many users have taken the survey
        return 0; // Default no sorting for now
    }
  });

  // Filter surveys based on search query
  const filteredSurveys = sortedSurveys.filter(survey => 
    survey.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    survey.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    survey.milestones.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleStartSurvey = (surveyId: string) => {
    // Get token from localStorage
    const authToken = localStorage.getItem('authToken');
    const guestToken = clientGuestUtils.getToken();
    const token = authToken || guestToken;
    
    if (!token) {
      console.error('No token available');
      return;
    }
    
    // Navigate to the survey page with token as query parameter
    router.push(`/user-testing/survey/${surveyId}?token=${encodeURIComponent(token)}`);
  };

  return (
    <div className={className}>
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-auto flex-1">
          <Input
            placeholder="Search surveys..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full md:w-[180px]">
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">Most Popular</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="progress">Your Progress</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredSurveys.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-xl">
          <h3 className="text-lg font-medium mb-2">No surveys found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredSurveys.map((survey) => (
            <Card key={survey.id} className="flex flex-col transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">{survey.name}</CardTitle>
                <CardDescription className="line-clamp-2">{survey.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="flex-grow pt-0">
                <div className="mb-4">
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{survey.progress}%</span>
                  </div>
                  <Progress value={survey.progress} className="h-2" />
                </div>
                
                <div className="text-sm">
                  <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2">Milestones:</p>
                  <ul className="space-y-1.5">
                    {survey.milestones.map((milestone) => (
                      <li 
                        key={milestone} 
                        className={`flex items-center ${milestone === survey.currentMilestone ? 'font-medium' : ''}`}
                      >
                        {milestone === survey.currentMilestone ? 
                          <span className="inline-block w-2 h-2 rounded-full bg-primary mr-2"></span> : 
                          <span className="inline-block w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700 mr-2"></span>
                        }
                        {milestone.replace(/_/g, ' ')}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              
              <CardFooter className="pt-0">
                <Button 
                  onClick={() => handleStartSurvey(survey.id)} 
                  className="w-full"
                  variant={survey.progress > 0 ? "default" : "default"}
                >
                  {survey.progress > 0 ? 'Continue Survey' : 'Start Survey'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 