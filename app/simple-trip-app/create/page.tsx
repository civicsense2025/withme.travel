'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

// Guest token cookie name
const GUEST_TOKEN_COOKIE = 'guest_token';

export default function CreateTripPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const supabase = createClient();
  const isGuestMode = searchParams?.get('guest') === 'true';

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | undefined, field: 'startDate' | 'endDate') => {
    setFormData((prev) => ({ ...prev, [field]: date }));
  };

  // Helper function to get or create guest token
  const getOrCreateGuestToken = () => {
    let guestToken = Cookies.get(GUEST_TOKEN_COOKIE);
    
    if (!guestToken) {
      guestToken = uuidv4();
      // Set cookie to expire in 30 days
      Cookies.set(GUEST_TOKEN_COOKIE, guestToken, { expires: 30 });
    }
    
    return guestToken;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supabase) {
      toast({
        title: 'Error',
        description: 'Could not initialize Supabase client',
        variant: 'destructive',
      });
      return;
    }

    // Basic validation
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Trip name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Check auth status
      const { data: userData, error: authError } = await supabase.auth.getUser();
      const isAuthenticated = !authError && userData?.user;
      
      // Initialize variables for user or guest mode
      let createdById: string | undefined = undefined;
      let guestToken: string | null = null;

      if (isAuthenticated && userData?.user?.id) {
        createdById = userData.user.id;
      } else if (isGuestMode) {
        // Use guest token
        guestToken = getOrCreateGuestToken();
      } else {
        throw new Error('You must be logged in to create a trip');
      }

      // Create the trip record - casting as any to bypass TypeScript errors for now
      // In a production app, you'd want to properly type this
      const insertResponse = await supabase
        .from('trips')
        .insert({
          name: formData.name,
          description: formData.description || null,
          start_date: formData.startDate ? formData.startDate.toISOString() : null,
          end_date: formData.endDate ? formData.endDate.toISOString() : null,
          created_by: createdById || null,
          privacy_setting: 'private',
        } as any)
        .select('id')
        .single();

      if (insertResponse.error) {
        throw new Error(insertResponse.error.message || 'Failed to create trip');
      }

      const tripId = insertResponse.data.id;

      // Add the creator as an admin if authenticated
      if (isAuthenticated && createdById) {
        await supabase.from('trip_members').insert({
          trip_id: tripId,
          user_id: createdById,
          role: 'admin',
        });
      }

      // Associate trip with guest token if using guest mode
      if (guestToken) {
        // Use a REST API call instead of direct Supabase access to bypass TypeScript issues
        // Create a simple API route that handles this
        const guestResponse = await fetch('/api/trips/associate-guest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            tripId, 
            guestToken, 
            role: 'admin' 
          })
        });

        if (!guestResponse.ok) {
          console.warn('Failed to associate guest with trip, but continuing anyway');
        }
      }

      toast({
        title: 'Success',
        description: 'Trip created successfully',
      });

      // Navigate to the new trip page
      router.push(`/simple-trip-app/${tripId}`);
    } catch (err: any) {
      console.error('Error creating trip:', err);
      toast({
        title: 'Error',
        description: err.message || 'An error occurred while creating the trip',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create a New Trip</CardTitle>
          <CardDescription>
            {isGuestMode 
              ? "Creating as a guest - no account required" 
              : "Fill in the details to start planning your trip"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Trip Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Summer Vacation 2023"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Add some details about your trip..."
                value={formData.description}
                onChange={handleChange}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="startDate"
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formData.startDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? format(formData.startDate, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => handleDateChange(date, 'startDate')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="endDate"
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formData.endDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? format(formData.endDate, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => handleDateChange(date, 'endDate')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/simple-trip-app')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Trip'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
