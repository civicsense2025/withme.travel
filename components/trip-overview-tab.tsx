'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { TagInput } from '@/components/ui/tag-input';
import { LocationSearch } from '@/components/location-search';
import { formatDateRange, formatError } from '@/lib/utils';
import { TripRole, API_ROUTES } from '@/utils/constants';
import { Tag } from '@/types/tag';
import { ItineraryTab } from '@/components/itinerary-tab';
import { MembersTab, TripMemberFromSSR } from "@/components/members-tab";
import { DisplayItineraryItem } from '@/app/trips/[tripId]/page';
import { ItinerarySection } from '@/app/trips/[tripId]/page';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Pencil } from 'lucide-react';

const overviewFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  description: z.string().max(500, "Description must be 500 characters or less").nullable(),
});

type OverviewFormValues = z.infer<typeof overviewFormSchema>;

interface TripOverviewTabProps {
  tripId: string;
  tripName: string;
  tripDescription: string | null;
  startDate: string | null;
  endDate: string | null;
  tripDurationDays: number | null;
  canEdit: boolean;
  initialMembers: TripMemberFromSSR[];
  initialSections: ItinerarySection[];
  initialUnscheduledItems: DisplayItineraryItem[];
  userRole: TripRole | null;
}

export function TripOverviewTab({ 
  tripId,
  tripName,
  tripDescription,
  startDate,
  endDate,
  tripDurationDays,
  canEdit,
  initialMembers,
  initialSections,
  initialUnscheduledItems,
  userRole,
}: TripOverviewTabProps) {

  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<OverviewFormValues>({
    resolver: zodResolver(overviewFormSchema),
    defaultValues: {
      name: tripName || '',
      description: tripDescription || '',
    }
  });

  useEffect(() => {
    form.reset({
      name: tripName || '',
      description: tripDescription || '',
    });
  }, [tripName, tripDescription, form, isEditing]);

  const onSubmit: SubmitHandler<OverviewFormValues> = async (data) => {
    setIsSaving(true);
    try {
      const payload = {
        name: data.name,
        description: data.description,
      };

      const response = await fetch(API_ROUTES.TRIP_DETAILS(tripId), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update trip details');
      }

      toast({ title: "Success", description: "Trip details updated." });
      setIsEditing(false);
      
    } catch (error) {
      console.error("Error updating trip details:", error);
      toast({ 
        title: "Error Updating Details", 
        description: formatError(error), 
        variant: "destructive" 
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <div className="md:col-span-1 space-y-6">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Trip Details</CardTitle>
                {canEdit && !isEditing && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                     <Pencil className="mr-2 h-4 w-4" /> Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      {isEditing ? (
                        <FormControl>
                          <Input {...field} disabled={isSaving} />
                        </FormControl>
                      ) : (
                        <p className="text-sm font-medium py-2 min-h-[40px] flex items-center">{field.value || tripName}</p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-1">
                  <Label>Dates</Label>
                  <p className="text-sm font-medium py-2">{formatDateRange(startDate || undefined, endDate || undefined) || 'Not set'}</p>
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                       {isEditing ? (
                        <FormControl>
                          <Textarea 
                            {...field} 
                            value={field.value ?? ''}
                            disabled={isSaving} 
                            className="min-h-[80px]"
                          />
                        </FormControl>
                       ) : (
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap py-2 min-h-[40px]">
                          {field.value || tripDescription || 'No description provided.'}
                        </p>
                       )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              {isEditing && (
                <CardFooter className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>Cancel</Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                    Save Changes
                  </Button>
                </CardFooter>
              )}
            </form>
          </Form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
          </CardHeader>
          <CardContent>
            <MembersTab
              tripId={tripId}
              canEdit={canEdit}
              userRole={userRole}
              initialMembers={initialMembers}
            />
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Itinerary</CardTitle>
          </CardHeader>
          <CardContent>
            <ItineraryTab 
              tripId={tripId} 
              initialSections={initialSections} 
              initialUnscheduledItems={initialUnscheduledItems}
              canEdit={canEdit} 
              startDate={startDate}
              endDate={endDate}
              tripDurationDays={tripDurationDays}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 