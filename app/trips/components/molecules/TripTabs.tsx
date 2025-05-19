import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { getServerSupabase } from '@/utils/supabase-server';
import { TABLES } from '@/utils/constants/tables';
import { listTrips } from '@/lib/api/trips';
import EnhancedTripCard from '@/components/features/trips/molecules/EnhancedTripCard';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { EmptyState } from '@/components/shared/molecules/EmptyState';

interface TripTabsProps {
  initialTrips: any[];
  userId: string;
  isGuest: boolean;
  userProfile: any;
}

export default function TripTabs({ initialTrips, userId, isGuest, userProfile }: TripTabsProps) {
  const { user } = useAuth();
  const [trips, setTrips] = useState(initialTrips);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrips() {
      try {
        setIsLoading(true);
        const supabase = await getServerSupabase();
        const result = await listTrips(userId);
        if (!result.success) throw new Error(result.error || 'Failed to fetch trips');
        setTrips(result.data.map((trip) => ({ trip })));
      } catch (error) {
        setError('Failed to load trips. Please try again.');
        console.error('Error fetching trips:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTrips();
  }, [userId]);

  if (isLoading) return <Spinner />;
  if (error) return <Alert variant="destructive">{error}</Alert>;
  if (trips.length === 0) return <EmptyState title="No trips found" />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {trips.map((trip) => (
        <EnhancedTripCard key={trip.id} trip={trip} />
      ))}
    </div>
  );
}
