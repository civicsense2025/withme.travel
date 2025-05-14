'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlaceCsvImporter, type PlaceImportResult } from '@/components/place-csv-importer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/utils/supabase/client';
import { ArrowLeft } from 'lucide-react';
import { TABLES } from '@/utils/constants/tables';

export default function ImportPlacesPage() {
  const [destinationId, setDestinationId] = useState<string>('');
  const [destinations, setDestinations] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchDestinations() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from(TABLES.DESTINATIONS)
          .select('id, name')
          .order('name');

        if (error) throw error;
        const filteredData = (data || []).filter(
          (item): item is { id: string; name: string } => item.name !== null
        );
        setDestinations(filteredData);
      } catch (error) {
        console.error('Error fetching destinations:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDestinations();
  }, [supabase]);

  const handleImportComplete = (result: PlaceImportResult) => {
    if (result.success && result.insertedPlaces && result.insertedPlaces.length > 0) {
      // Optionally redirect to a place management page or destination detail page
      // router.push(`/admin/places?destination=${destinationId}`);
      console.log('Import successful:', result);
    }
  };

  const handleBackClick = () => {
    router.back();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={handleBackClick}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Import Places from CSV</h1>
        </div>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Select Destination</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Choose the destination where you want to import places.
          </p>
          <Select value={destinationId} onValueChange={setDestinationId} disabled={isLoading}>
            <SelectTrigger className="w-full max-w-sm">
              {destinationId ? (
                <SelectValue />
              ) : (
                <span className="text-muted-foreground">Select a destination</span>
              )}
            </SelectTrigger>
            <SelectContent>
              {destinations.map((destination) => (
                <SelectItem key={destination.id} value={destination.id}>
                  {destination.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {destinationId ? (
          <PlaceCsvImporter
            destinationId={destinationId}
            onSuccess={handleImportComplete}
            onCancel={() => router.back()}
          />
        ) : (
          <div className="bg-muted p-6 rounded-md text-center">
            <p className="text-muted-foreground">Please select a destination to continue.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
