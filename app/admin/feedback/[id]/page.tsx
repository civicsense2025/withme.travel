import { redirect } from 'next/navigation';
import { Container } from '@/components/container';
import { checkAdminAuth } from '../../utils/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TABLES } from '@/utils/constants/tables';
import { createServerComponentClient } from '@/utils/supabase/server';
import { PostgrestSingleResponse } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

interface FeedbackDetailProps {
  params: {
    id: string;
  };
}

// Define the Feedback type
interface Feedback {
  id: string;
  status: string;
  type: string;
  content: string;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string | null;
  email: string | null;
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string;
  } | null;
}

// Define the response type from Supabase
interface FeedbackResponse {
  id: string;
  status: string;
  type: string;
  content: string;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string | null;
  email: string | null;
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string;
  } | null;
}

export default async function FeedbackDetailPage({ params }: FeedbackDetailProps) {
  const { id } = params;
  const { isAdmin, supabase } = await checkAdminAuth();

  if (!isAdmin) {
    redirect('/login?redirectTo=/admin/feedback');
  }

  if (!supabase) {
    redirect('/login?error=supabase_client_error');
  }

  // Fetch the feedback item
  const { data, error } = await supabase
    .from(TABLES.FEEDBACK)
    .select(
      `
      id,
      status,
      type,
      content,
      metadata,
      created_at,
      updated_at,
      email,
      user:profiles(id, full_name, email, avatar_url)
    `
    )
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    console.error('Error fetching feedback:', error ?? 'No data returned');
    redirect('/admin/feedback');
  }

  // Safe type assertion with unknown intermediate step
  const feedbackData = data as unknown as FeedbackResponse;

  // Create the feedback object with proper typing
  const feedback: Feedback = {
    id: feedbackData.id,
    status: feedbackData.status,
    type: feedbackData.type,
    content: feedbackData.content,
    metadata: feedbackData.metadata ?? null,
    created_at: feedbackData.created_at,
    updated_at: feedbackData.updated_at ?? null,
    email: feedbackData.email ?? null,
    user: feedbackData.user
      ? {
          id: feedbackData.user.id,
          full_name: feedbackData.user.full_name,
          email: feedbackData.user.email,
          avatar_url: feedbackData.user.avatar_url,
        }
      : null,
  };

  // Format user data
  const user = feedback.user;

  // Helper function for status badge
  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      archived: 'bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300',
    };

    return <Badge className={colors[status] || colors.new}>{status.replace('_', ' ')}</Badge>;
  };

  // Helper function for type badge
  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      bug_report: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      feature_request: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      general: 'bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300',
      improvement: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      question: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      other: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    };

    return <Badge className={colors[type] || colors.other}>{type.replace('_', ' ')}</Badge>;
  };

  return (
    <Container>
      <div className="mb-6">
        <Link href="/admin/feedback" legacyBehavior>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Feedback
          </Button>
        </Link>

        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold">Feedback Details</h1>
          <div className="flex gap-2">
            {getStatusBadge(feedback.status)}
            {getTypeBadge(feedback.type)}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap">{feedback.content}</div>
            </CardContent>
          </Card>

          {feedback.metadata && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-4 rounded-md">
                  <pre className="text-sm overflow-x-auto">
                    {JSON.stringify(feedback.metadata, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent>
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name || 'User'}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary">{(user.full_name || 'U')[0]}</span>
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{user.full_name || 'No Name'}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>

                  <div>
                    <Link href={`/admin/users/${user.id}`} legacyBehavior>
                      <Button variant="outline" size="sm" className="w-full">
                        View User Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : feedback.email ? (
                <div>
                  <div className="text-sm text-muted-foreground">Email:</div>
                  <div className="font-medium">{feedback.email}</div>
                </div>
              ) : (
                <div className="text-muted-foreground">Anonymous feedback</div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Submitted</dt>
                  <dd className="font-medium">{new Date(feedback.created_at).toLocaleString()}</dd>
                </div>
                {feedback.updated_at && feedback.updated_at !== feedback.created_at && (
                  <div>
                    <dt className="text-sm text-muted-foreground">Last Updated</dt>
                    <dd className="font-medium">
                      {new Date(feedback.updated_at).toLocaleString()}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm text-muted-foreground">ID</dt>
                  <dd className="font-mono text-xs overflow-hidden text-ellipsis">{feedback.id}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <div className="mt-6 flex flex-col gap-2">
            <Button variant="outline" asChild>
              <Link href={`/admin/feedback/${id}/edit`}>Edit Feedback</Link>
            </Button>

            <form action={`/api/admin/feedback/${id}/delete`} method="POST">
              <Button variant="destructive" className="w-full" type="submit">
                Delete Feedback
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Container>
  );
}
