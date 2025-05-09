import { createServerComponentClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Container } from '@/components/container';
import { checkAdminAuth } from '../utils/auth';
import DestinationsTable from './DestinationsTable';
import { TABLES } from '@/utils/constants/database-multi-city';

export const metadata = {
  title: 'Manage Destinations | Admin Panel',
  description: 'Manage destinations and cities on withme.travel',
};

export default async function AdminDestinationsPage() {
  const { isAdmin, supabase, error } = await checkAdminAuth();

  if (!isAdmin) {
    redirect('/login?redirectTo=/admin/destinations');
  }

  if (!supabase) {
    redirect('/login?error=supabase_client_error');
  }

  // Get count of cities for pagination metadata
  const { count } = await supabase
    .from(TABLES.CITIES)
    .select('*', { count: 'exact', head: true });
  
  // Fetch first page of cities (limited to 50 for initial load)
  const { data: cities, error: fetchError } = await supabase
    .from(TABLES.CITIES)
    .select(`
      id,
      name,
      country,
      admin_name,
      continent,
      latitude,
      longitude,
      population,
      destinations:destinations(id, name)
    `)
    .order('name')
    .limit(50);

  if (fetchError) {
    console.error('Error fetching cities:', fetchError);
  }

  return (
    <Container>
      <DestinationsTable 
        initialData={cities || []} 
        totalCount={count || 0}
      />
    </Container>
  );
} 