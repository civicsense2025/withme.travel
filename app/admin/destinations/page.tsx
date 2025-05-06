import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Container } from '@/components/container';
import { checkAdminAuth } from '../utils/auth';
import DestinationsTable from './DestinationsTable';

export const metadata = {
  title: 'Manage Destinations | Admin Panel',
  description: 'Manage destinations on withme.travel',
};

export default async function AdminDestinationsPage() {
  const { isAdmin, supabase, error } = await checkAdminAuth();

  if (!isAdmin) {
    redirect('/login?redirectTo=/admin/destinations');
  }

  if (!supabase) {
    redirect('/login?error=supabase_client_error');
  }

  // Fetch destinations (limited to 50 for now - would implement pagination in a full solution)
  const { data: destinations, error: fetchError } = await supabase
    .from('DESTINATIONS')
    .select(`
      id,
      name,
      city,
      country,
      continent,
      popularity,
      likes_count
    `)
    .order('popularity', { ascending: false })
    .limit(50);

  if (fetchError) {
    console.error('Error fetching destinations:', fetchError);
  }

  return (
    <Container>
      <DestinationsTable initialData={destinations || []} />
    </Container>
  );
} 