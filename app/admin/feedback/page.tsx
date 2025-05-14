import { redirect } from 'next/navigation';
import { Container } from '@/components/container';
import { checkAdminAuth } from '../utils/auth';
import FeedbackTable from './FeedbackTable';
import { TABLES } from '@/utils/constants/tables';

export const metadata = {
  title: 'Manage Feedback | Admin Panel',
  description: 'Manage user feedback on withme.travel',
};

// Define the feedback item type
export interface FeedbackItem {
  id: string;
  user_id: string | null;
  email: string | null;
  content: string;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any> | null;
  user?: {
    full_name: string | null;
    email: string | null;
  } | null;
}

export default async function AdminFeedbackPage() {
  const { isAdmin, supabase } = await checkAdminAuth();

  if (!isAdmin) {
    redirect('/login?redirectTo=/admin/feedback');
  }

  if (!supabase) {
    redirect('/login?error=supabase_client_error');
  }

  // Fetch feedback items
  const { data, error } = await supabase
    .from(TABLES.FEEDBACK)
    .select(
      `
      id,
      user_id,
      email,
      content,
      type,
      status,
      created_at,
      updated_at,
      metadata,
      user:profiles!feedback_user_id_fkey(full_name, email)
    `
    )
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching feedback:', error);
  }

  // Convert the raw data to our expected type
  const feedbackItems: FeedbackItem[] = (data || []).map((item) => ({
    ...item,
    // Convert the array return format to an object
    user:
      item.user && item.user.length > 0
        ? {
            full_name: item.user[0]?.full_name || null,
            email: item.user[0]?.email || null,
          }
        : null,
  }));

  // Type guard for FeedbackItem
  function isFeedbackItem(f: any): f is FeedbackItem {
    return (
      f &&
      typeof f === 'object' &&
      'id' in f &&
      'type' in f &&
      'status' in f &&
      'content' in f &&
      'created_at' in f
    );
  }

  const safeFeedback: FeedbackItem[] = (feedbackItems || []).filter(isFeedbackItem).map((f) => ({
    id: f.id ?? '',
    user_id: f.user_id ?? '',
    email: f.email ?? '',
    content: f.content ?? '',
    type: f.type ?? 'General',
    status: f.status ?? 'open',
    created_at: f.created_at ?? '',
    updated_at: f.updated_at ?? '',
    metadata: f.metadata ?? {},
  }));

  return (
    <Container>
      <FeedbackTable initialData={safeFeedback} />
    </Container>
  );
}
