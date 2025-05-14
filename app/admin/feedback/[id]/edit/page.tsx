import { redirect } from 'next/navigation';
import { Container } from '@/components/container';
import { checkAdminAuth } from '../../../utils/auth';
import FeedbackEditForm from './FeedbackEditForm';
import { TABLES } from '@/utils/constants/tables';

export const dynamic = 'force-dynamic';

// Define the feedback data structure
interface FeedbackUser {
  id: string;
  full_name: string | null;
  email: string | null;
}

interface FeedbackData {
  id: string;
  user_id: string | null;
  email: string | null;
  content: string;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any> | null;
  user: FeedbackUser | null;
}

interface FeedbackEditPageProps {
  params: {
    id: string;
  };
}

export default async function FeedbackEditPage({ params }: FeedbackEditPageProps) {
  const { id } = params;
  const { isAdmin, supabase } = await checkAdminAuth();

  if (!isAdmin) {
    redirect('/login?redirectTo=/admin/feedback/' + id + '/edit');
  }

  if (!supabase) {
    redirect('/login?error=supabase_client_error');
  }

  // Fetch the feedback item with proper typing
  const result = await supabase
    .from(TABLES.FEEDBACK)
    .select(
      `
      id, content, type, status, created_at, updated_at, metadata, email, user_id,
      user:profiles(id, full_name, email)
    `
    )
    .eq('id', id)
    .single();

  // Check for errors in the query response
  if (result.error || !result.data) {
    console.error('Error fetching feedback:', result.error);
    redirect('/admin/feedback');
  }

  // Use an unknown type intermediate to safely convert to our expected type
  const rawData = result.data as unknown;
  // Now cast to our expected type
  const feedback = rawData as FeedbackData;

  // Format user data - Ensure it matches the expected FeedbackUser type
  const user: FeedbackUser | null = feedback.user
    ? {
        id: feedback.user.id,
        full_name: feedback.user.full_name,
        email: feedback.user.email,
      }
    : null;

  // Prepare the data for the form - ensuring it matches the FeedbackData interface
  const formData: FeedbackData = {
    id: feedback.id,
    content: feedback.content,
    type: feedback.type,
    status: feedback.status,
    created_at: feedback.created_at,
    updated_at: feedback.updated_at || feedback.created_at,
    metadata: feedback.metadata,
    user_id: feedback.user_id,
    email: feedback.email,
    user: user,
  };

  return (
    <Container>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Feedback</h1>
        <p className="text-gray-500 dark:text-gray-400">Update feedback details and status</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
        <FeedbackEditForm initialData={formData} />
      </div>
    </Container>
  );
}
