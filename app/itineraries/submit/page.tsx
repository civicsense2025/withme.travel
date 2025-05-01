import { getServerComponentClient } from '@/utils/supabase/unified';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { CreateItineraryClient } from './page-client';

// Force dynamic rendering due to cookie usage
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Create Itinerary | withme.travel',
  description: 'Share your travel expertise by creating a detailed itinerary that others can use.',
};

export default async function CreateItineraryPage() {
  const supabase = await getServerComponentClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If not authenticated, redirect to login page
  if (!user) {
    redirect('/login?redirect=/itineraries/submit');
  }

  return <CreateItineraryClient />;
}
