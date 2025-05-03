'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { TABLES } from '@/utils/constants/database';
import { Button } from '@/components/ui/button';

// Define a type for destination
interface Destination {
  id: string;
  name: string;
  city?: string;
  country?: string;
  [key: string]: any; // Allow for other properties we might not be using
}

export default function DestinationsClient() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchDestinations() {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        );

        const { data, error } = await supabase
          .from(TABLES.DESTINATIONS)
          .select('*')
          .order('name', { ascending: true })
          .limit(20);

        if (error) {
          console.error('Error fetching destinations:', error);
          throw error;
        }

        setDestinations(data || []);
      } catch (error) {
        console.error('Failed to load destinations:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDestinations();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-12">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-3xl overflow-hidden h-48 bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (destinations.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold mb-2">No destinations found</h3>
        <p className="text-muted-foreground mb-6">Try again later or explore another section</p>
        <Button onClick={() => router.push('/')}>Go home</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-12">
      {destinations.map((destination: any) => (
        <div
          key={destination.id}
          className="rounded-3xl overflow-hidden h-48 bg-muted cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => router.push(`/destinations/${destination.id}`)}
        >
          <div className="h-full w-full flex items-end p-4 bg-gradient-to-t from-black/60 to-transparent">
            <div className="text-white">
              <h3 className="font-semibold text-lg">{destination.name}</h3>
              {destination.country && <p className="text-sm opacity-90">{destination.country}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
