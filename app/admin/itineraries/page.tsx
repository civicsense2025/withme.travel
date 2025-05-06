import { redirect } from 'next/navigation';
import { Container } from '@/components/container';
import { checkAdminAuth } from '../utils/auth';
import ItinerariesTable, { Itinerary } from './ItinerariesTable';

export const metadata = {
  title: 'Manage Itineraries | Admin Panel',
  description: 'Manage itinerary templates on withme.travel',
};

export default async function AdminItinerariesPage() {
  const { isAdmin, supabase } = await checkAdminAuth();

  if (!isAdmin) {
    redirect('/login?redirectTo=/admin/itineraries');
  }

  if (!supabase) {
    redirect('/login?error=supabase_client_error');
  }

  // Fetch itinerary templates without joining profiles
  const { data, error } = await supabase
    .from('itinerary_templates')
    .select(`
      id,
      title,
      slug,
      destination,
      created_at,
      created_by,
      is_published,
      days
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching itineraries:', error);
  }

  // Convert to the expected format for the table
  const itineraries: Itinerary[] = (data || []).map(item => ({
    ...item,
    profiles: null // No profile data for now
  }));

  return (
    <Container>
      <ItinerariesTable initialData={itineraries} />
    </Container>
  );
} 