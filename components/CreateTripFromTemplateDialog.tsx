'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { API_ROUTES } from '@/utils/constants/routes';

interface CreateTripFromTemplateDialogProps {
  templateSlug: string;
  templateTitle: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function CreateTripFromTemplateDialog({
  templateSlug,
  templateTitle,
  isOpen,
  onOpenChange,
}: CreateTripFromTemplateDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [tripName, setTripName] = useState<string>(`Trip based on ${templateTitle}`);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateTrip = async () => {
    if (!tripName.trim()) {
      toast({
        title: 'Trip Name Required',
        description: 'Please enter a name for your trip.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(API_ROUTES.APPLY_TEMPLATE(templateSlug), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: tripName,
          start_date: startDate ? format(startDate, 'yyyy-MM-dd') : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create trip from template');
      }

      toast({ title: 'Trip Created!', description: 'Your new trip is ready.' });
      onOpenChange(false); // Close this dialog
      router.push(`/trips/${result.trip_id}`); // Navigate to the new trip
    } catch (error: any) {
      console.error('Error creating trip from template:', error);
      toast({
        title: 'Error',
        description: error.message || 'Could not create trip.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a trip from this itinerary</DialogTitle>
          <DialogDescription>
            This will create a new trip using "{templateTitle}" as a template.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="trip-name" className="text-right">
              Trip Name
            </Label>
            <Input
              id="trip-name"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Summer Getaway"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start-date" className="text-right">
              Start Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={`col-span-3 justify-start text-left font-normal ${!startDate && 'text-muted-foreground'}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP') : <span>Pick a date (Optional)</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleCreateTrip} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
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
