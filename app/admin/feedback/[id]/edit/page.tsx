import { redirect } from 'next/navigation';
import { Container } from '@/components/container';
import { checkAdminAuth } from '../../../utils/auth';
import FeedbackEditForm from './FeedbackEditForm';

export const dynamic = 'force-dynamic';

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

  // Fetch the feedback item
  const { data: feedback, error } = await supabase
    .from('feedback')
    .select(`
      *,
      user:profiles!feedback_user_id_fkey(id, full_name, email)
    `)
    .eq('id', id)
    .single();

  if (error || !feedback) {
    console.error('Error fetching feedback:', error);
    redirect('/admin/feedback');
  }

  // Format user data
  const user = feedback.user && feedback.user.length > 0 
    ? feedback.user[0] 
    : null;

  // Prepare the data for the form
  const formData = {
    ...feedback,
    user: user,
  };

  return (
    <Container>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Feedback</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Update feedback details and status
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
        <FeedbackEditForm initialData={formData} />
      </div>
    </Container>
  );
} 