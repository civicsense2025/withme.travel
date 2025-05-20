'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, FileText } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';

interface FeedbackItem {
  id: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  content: string;
  date: string;
  type: 'feedback' | 'bug' | 'suggestion';
}

interface SurveyResponse {
  id: string;
  form_id: string;
  user_id: string | null;
  status: string | null;
  data: any;
  created_at: string;
  updated_at: string | null;
  form_name: string;
}

export function TabbledFeedback() {
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // For now, use mock feedback data - in the future, this would be fetched from an API
        setFeedbackItems([
          {
            id: '1',
            user: {
              name: 'Emma Wilson',
              email: 'emma@example.com',
              avatar: '/avatars/emma.jpg',
            },
            content: 'The itinerary builder is amazing but could use a better mobile interface.',
            date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            type: 'feedback',
          },
          {
            id: '2',
            user: {
              name: 'Alex Chen',
              email: 'alex@example.com',
            },
            content: 'Encountered error when trying to add more than 10 people to a trip.',
            date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            type: 'bug',
          },
          {
            id: '3',
            user: {
              name: 'Sofia Rodriguez',
              email: 'sofia@example.com',
              avatar: '/avatars/sofia.jpg',
            },
            content: 'Would be great to add calendar integration with Google Calendar.',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            type: 'suggestion',
          },
        ]);

        // Fetch recent survey responses
        const surveyResponse = await fetch('/api/admin/surveys/recent-responses');
        if (surveyResponse.ok) {
          const data = await surveyResponse.json();
          setSurveyResponses(data.responses);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Helper to get user name from response data
  const getUserName = (response: SurveyResponse) => {
    // Try to get name from response data
    if (response.data && typeof response.data === 'object') {
      // Look for common name fields in the response data
      const nameField =
        response.data.name ||
        response.data.fullName ||
        response.data.user_name ||
        response.data.userName;

      if (nameField) return nameField;
    }

    // Fallback to first initial if we have a user_id
    if (response.user_id) return response.user_id.substring(0, 1).toUpperCase();

    // Default fallback
    return 'A';
  };

  if (isLoading) {
    return (
      <div className="space-y-5 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start space-x-4 p-3">
            <div className="h-10 w-10 rounded-full bg-muted"></div>
            <div className="flex-1">
              <div className="h-4 w-1/3 bg-muted rounded mb-2"></div>
              <div className="h-4 w-full bg-muted rounded"></div>
              <div className="h-4 w-2/3 bg-muted rounded mt-2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Tabs defaultValue="feedback">
      <TabsList className="mb-4">
        <TabsTrigger value="feedback">
          <MessageSquare className="h-4 w-4 mr-2" />
          Feedback
        </TabsTrigger>
        <TabsTrigger value="surveys">
          <FileText className="h-4 w-4 mr-2" />
          Survey Responses
        </TabsTrigger>
      </TabsList>
      <TabsContent value="feedback" className="space-y-5">
        {feedbackItems.length > 0 ? (
          feedbackItems.map((item) => (
            <Link
              href={`/admin/feedback/${item.id}`}
              key={item.id}
              className="block"
             >
              <div className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <Avatar className="h-10 w-10">
                  {item.user.avatar ? (
                    <AvatarImage src={item.user.avatar} alt={item.user.name} />
                  ) : (
                    <AvatarFallback>{item.user.name.charAt(0)}</AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium">{item.user.name}</p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(item.date)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{item.content}</p>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center text-xs px-2 py-1 rounded-full text-xs font-medium ${
                        item.type === 'bug'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          : item.type === 'suggestion'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}
                    >
                      <MessageSquare className="mr-1 h-3 w-3" />
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-6 text-muted-foreground">No recent feedback available</div>
        )}
      </TabsContent>
      <TabsContent value="surveys" className="space-y-5">
        {surveyResponses.length > 0 ? (
          surveyResponses.map((response) => (
            <Link
              href={`/admin/surveys/${response.form_id}/responses/${response.id}`}
              key={response.id}
              className="block"
             >
              <div className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{getUserName(response).charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium">
                      {response.user_id ? 'User ' + response.user_id.substring(0, 8) : 'Anonymous'}
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(response.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                    Responded to <span className="font-medium">{response.form_name}</span>
                  </p>
                  <div className="mt-1">
                    <Badge variant="outline" className="text-xs">
                      {Object.keys(response.data || {}).length} answers
                    </Badge>
                    {response.status ? (
                      <Badge
                        variant={response.status === 'completed' ? 'secondary' : 'outline'}
                        className="text-xs ml-2"
                      >
                        {response.status.charAt(0).toUpperCase() + response.status.slice(1)}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-xs ml-2 text-amber-600 border-amber-600"
                      >
                        In Progress
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            No recent survey responses available
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
