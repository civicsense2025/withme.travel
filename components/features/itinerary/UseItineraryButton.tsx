'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/hooks/use-toast'
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface UseItineraryButtonProps {
  slug: string;
  className?: string;
}

export function UseItineraryButton({ slug, className }: UseItineraryButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tripName, setTripName] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleApplyTemplate = async () => {
    if (!tripName) {
      toast({
        title: 'Trip name required',
        description: 'Please enter a name for your new trip',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/itineraries/${slug}/use`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: tripName,
          start_date: startDate ? format(startDate, 'yyyy-MM-dd') : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to use this itinerary');
      }

      toast({
        title: 'Success!',
        description: 'Trip created from this itinerary template. Redirecting to your new trip...',
      });

      // Redirect to the new trip
      router.push(`/trips/${data.trip_id}`);
    } catch (error: any) {
      console.error('Error using itinerary:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to use this itinerary. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={handleOpenDialog} className={className}>
        Use This Itinerary
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create a trip from this itinerary</DialogTitle>
            <DialogDescription>
              This will create a new trip using this itinerary as a template.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="trip-name">Trip Name</Label>
              <Input
                id="trip-name"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                placeholder="Enter a name for your trip"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="start-date">Start Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="start-date"
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${!startDate ? 'text-muted-foreground' : ''}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleApplyTemplate} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Trip'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
