import { createServerComponentClient } from '@/utils/supabase/server';
import { handleQueryResult } from '@/utils/type-safety';
import { redirect } from 'next/navigation';
import { Container } from '@/components/container';
import DestinationForm from '../components/DestinationForm';
import { TABLES } from '@/utils/constants/database';
import type { Database } from '@/utils/constants/database.types';

export const metadata = {
  title: 'Edit Destination | Admin Panel',
  description: 'Edit destination details',
};

interface PageProps {
  params: { id: string };
}

/**
 * EditDestinationPage allows admins to edit a destination by ID.
 * Fetches the destination from Supabase and passes it to the form.
 * Redirects to the destinations list if not found.
 *
 * @param params - Route params containing the destination ID
 */
export default async function EditDestinationPage({ params }: PageProps) {
  const { id } = params;
  // TODO: Replace with real admin check
  // For now, just allow access
  const db = await createServerComponentClient();

  // Fetch the destination
  const { data: destination, error } = await db
    .from(TABLES.DESTINATIONS)
    .select('*')
    .eq('id', id)
    .single();

  if (error || !destination) {
    // If destination doesn't exist, redirect to destinations list
    redirect('/admin/destinations');
  }

  // Defensive: Ensure all fields are present and fallback for nulls
  const safeDestination = destination
    ? {
        ...destination,
        city: destination.city ?? '',
        country: destination.country ?? '',
        continent: destination.continent ?? '',
        description: destination.description ?? '',
        image_url: destination.image_url ?? '',
        popularity: destination.popularity ?? null,
        accessibility: destination.accessibility ?? null,
        wifi_connectivity: destination.wifi_connectivity ?? null,
        likes_count: destination.likes_count ?? null,
        walkability: destination.walkability ?? null,
        name: destination.name ?? '',
        slug: destination.slug ?? null,
        id: destination.id ?? '',
      }
    : {
        city: '',
        country: '',
        continent: '',
        description: '',
        image_url: '',
        popularity: null,
        accessibility: null,
        wifi_connectivity: null,
        likes_count: null,
        walkability: null,
        name: '',
        slug: null,
        id: '',
      };

  return (
    <Container>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Destination</h1>
        <p className="text-gray-500 dark:text-gray-400">Update the destination details below</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
        {safeDestination ? (
          <DestinationForm
            initialData={{
              ...safeDestination,
              // Ensure all fields match the Destination type (no nulls for numbers, use undefined instead)
              popularity: safeDestination.popularity ?? undefined,
              accessibility: safeDestination.accessibility ?? undefined,
              wifi_connectivity: safeDestination.wifi_connectivity ?? undefined,
              likes_count: safeDestination.likes_count ?? undefined,
              walkability: safeDestination.walkability ?? undefined,
              name: safeDestination.name ?? '',
              slug: safeDestination.slug ?? undefined,
              id: safeDestination.id ?? '',
            }}
          />
        ) : (
          <div>Destination not found.</div>
        )}
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
