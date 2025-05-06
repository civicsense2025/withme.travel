import { checkAdminAuth } from '../../utils/auth';
import { redirect } from 'next/navigation';
import { Container } from '@/components/container';
import DestinationForm from '../components/DestinationForm';

export const metadata = {
  title: 'Edit Destination | Admin Panel',
  description: 'Edit destination details',
};

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditDestinationPage({ params }: PageProps) {
  const { id } = params;
  const { isAdmin, supabase } = await checkAdminAuth();

  if (!isAdmin) {
    redirect('/login?redirectTo=/admin/destinations');
  }

  if (!supabase) {
    redirect('/login?error=supabase_client_error');
  }

  // Fetch the destination
  const { data: destination, error } = await supabase
    .from('destinations')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !destination) {
    // If destination doesn't exist, redirect to destinations list
    redirect('/admin/destinations');
  }

  return (
    <Container>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Destination</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Update the destination details below
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
        <DestinationForm initialData={destination} />
      </div>
    </Container>
  );
}

// Generate static paths for commonly accessed destinations (optional)
export async function generateStaticParams() {
  // This would normally fetch the most commonly accessed destinations
  // For now, we'll return an empty array which means no static generation
  return [];
} 