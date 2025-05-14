'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, MapPin } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWhiteboardContext } from '../context/whiteboard-context';

interface ConvertToTripModalProps {
  groupId: string;
  planId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConvertToTripModal({
  groupId,
  planId,
  isOpen,
  onOpenChange,
}: ConvertToTripModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { ideas, destination } = useWhiteboardContext();
  const [isLoading, setIsLoading] = useState(false);
  const [tripName, setTripName] = useState('');
  const [existingTrips, setExistingTrips] = useState<any[]>([]); // We'd fetch these in a real implementation
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [createNewTrip, setCreateNewTrip] = useState(true);

  // In a real implementation, you'd fetch the user's trips here
  // For now, we'll use a placeholder

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      // Make the API call to convert ideas to a trip
      const response = await fetch(`/api/groups/${groupId}/plans/${planId}/convert-to-trip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tripId: createNewTrip ? undefined : selectedTripId,
          destinationId: destination?.id,
          // If creating a new trip, use the provided name or fall back to plan name
          tripName: createNewTrip ? tripName || 'Trip from Idea Board' : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to convert to trip');
      }

      const data = await response.json();

      toast({
        title: 'Success!',
        description: `Created trip "${data.trip.title}" with ${data.itemsCount} activities`,
      });

      // Close the modal
      onOpenChange(false);

      // Navigate to the new trip
      router.push(`/trips/${data.trip.id}`);
    } catch (error) {
      console.error('Error converting to trip:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to convert to trip',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Convert Ideas to Trip</DialogTitle>
          <DialogDescription>
            Create a new trip or add these activities to an existing trip.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="new-trip"
                checked={createNewTrip}
                onCheckedChange={(checked) => setCreateNewTrip(checked as boolean)}
              />
              <Label htmlFor="new-trip">Create a new trip</Label>
            </div>
          </div>

          {createNewTrip ? (
            <div className="space-y-2">
              <Label htmlFor="trip-name">Trip Name</Label>
              <Input
                id="trip-name"
                placeholder="Enter trip name"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
              />

              {destination && (
                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>Destination: {destination.name}</span>
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-2">
                {ideas.length} activities will be added to your trip
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="existing-trip">Select an existing trip</Label>
              <Select value={selectedTripId} onValueChange={setSelectedTripId}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {existingTrips.length > 0 ? (
                    existingTrips.map((trip) => (
                      <SelectItem key={trip.id} value={trip.id}>
                        {trip.title}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-2 text-sm text-muted-foreground">
                      No trips available
                    </div>
                  )}
                </SelectContent>
              </Select>

              <p className="text-xs text-muted-foreground mt-2">
                {existingTrips.length === 0 ? (
                  <span className="text-amber-500">
                    You don't have any trips yet. Create a new one instead.
                  </span>
                ) : (
                  `${ideas.length} activities will be added to the selected trip`
                )}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex space-x-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || (existingTrips.length === 0 && !createNewTrip)}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Create Trip'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
