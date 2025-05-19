'use client';
import { ITINERARY_CATEGORIES } from '@/utils/constants/status';
import { API_ROUTES } from '@/utils/constants/routes';

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/lib/hooks/use-toast';
import { type DisplayItineraryItem } from '@/types/itinerary';
import { LocationSearch, type MapboxPlace } from '@/components/location-search';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useResearchTracking } from '@/hooks/use-research-tracking';

// --- Add Local Currency Lookup (using country code now) ---
const countryCurrencyMap: Record<string, string> = {
  US: 'USD',
  CA: 'CAD',
  MX: 'MXN',
  GB: 'GBP',
  FR: 'EUR',
  DE: 'EUR',
  ES: 'EUR',
  IT: 'EUR',
  JP: 'JPY',
  AU: 'AUD',
  BR: 'BRL',
  // Add more countries as needed
};

function getDefaultCurrency(countryCode?: string): string | undefined {
  if (!countryCode) return undefined;
  return countryCurrencyMap[countryCode.toUpperCase()];
}
// --- End Local Currency Lookup ---

// Define Zod schema for validation
const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150, 'Title too long'),
  location: z.string().max(150, 'Location too long').optional().nullable(),
  address: z.string().max(250, 'Address too long').optional().nullable(),
  date: z.date().optional().nullable(),
  start_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)')
    .optional()
    .nullable(),
  end_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)')
    .optional()
    .nullable(),
  category: z.string().optional().nullable(),
  estimated_cost: z.coerce.number().min(0, 'Cost cannot be negative').optional().nullable(),
  currency: z.string().length(3, 'Invalid currency code').optional().nullable(),
  notes: z.string().optional().nullable(),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
});

type ItineraryFormValues = z.infer<typeof formSchema>;

// Restore the interface definition
interface ItineraryItemFormProps {
  tripId: string;
  initialData?: DisplayItineraryItem | null; // For editing
  dayNumber?: number | null; // Pass the target day/unscheduled
  onSave: (savedItem: DisplayItineraryItem) => void; // Callback on successful save
  onItemAdded?: (newItem: DisplayItineraryItem) => void; // <-- New callback for adding
  onClose: () => void; // Callback to close the sheet/modal
  // Add other necessary props like available currencies if needed
}

// Add export back to the function definition
export function ItineraryItemForm({
  tripId,
  initialData,
  dayNumber, // <-- Use dayNumber from props
  onSave,
  onItemAdded, // <-- Accept new callback
  onClose,
}: ItineraryItemFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!initialData?.id;
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const { trackEvent } = useResearchTracking();

  const form = useForm<ItineraryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || '',
      location: initialData?.location || '',
      address: initialData?.address || '',
      date:
        initialData?.date && typeof initialData.date === 'string'
          ? parseISO(initialData.date)
          : null,
      start_time: initialData?.start_time || null,
      end_time: initialData?.end_time || null,
      category: initialData?.category || null,
      estimated_cost: initialData?.estimated_cost || null,
      currency: initialData?.currency || null,
      notes: typeof initialData?.notes === 'string' ? initialData.notes : '',
      latitude: initialData?.latitude || null,
      longitude: initialData?.longitude || null,
    },
  });

  useEffect(() => {
    // When editing, check if any optional fields have data to determine if advanced options should be shown initially.
    if (isEditing && initialData) {
      const hasStartTime = 'start_time' in initialData && !!initialData.start_time;
      const hasCategory = 'category' in initialData && !!initialData.category;
      const hasCost = 'estimated_cost' in initialData && initialData.estimated_cost != null;
      const hasNotes = 'notes' in initialData && !!initialData.notes;

      if (hasStartTime || hasCategory || hasCost || hasNotes) {
        setShowMoreOptions(true);
      }
    } else if (!isEditing) {
      setShowMoreOptions(false);
    }
  }, [isEditing, initialData]);

  useEffect(() => {
    form.reset({
      title: initialData?.title || '',
      location: initialData?.location || '',
      address: initialData?.address || '',
      date:
        initialData?.date && typeof initialData.date === 'string'
          ? parseISO(initialData.date)
          : null,
      start_time: initialData?.start_time || null,
      end_time: initialData?.end_time || null,
      category: initialData?.category || null,
      estimated_cost: initialData?.estimated_cost || null,
      currency: initialData?.currency || null,
      notes: typeof initialData?.notes === 'string' ? initialData.notes : '',
      latitude: initialData?.latitude || null,
      longitude: initialData?.longitude || null,
    });
  }, [initialData, form]);

  // --- Location Select Handler (updated) ---
  const handleLocationSelect = (place: MapboxPlace | null) => {
    if (place) {
      // Use the fields from MapboxPlace
      form.setValue('location', place.name, { shouldValidate: true }); // Use primary name
      form.setValue('address', place.address, { shouldValidate: true }); // Use full address

      // Use countryCode for currency lookup
      const defaultCurrency = getDefaultCurrency(place.countryCode);

      if (defaultCurrency && !form.getValues('currency')) {
        form.setValue('currency', defaultCurrency, { shouldValidate: true });
        toast({
          title: 'Currency Updated',
          description: `Set to ${defaultCurrency} based on location (${place.country || place.countryCode}).`,
          duration: 2500,
        });
      }
      // Update lat/lng if available
      if (place.latitude && place.longitude) {
        form.setValue('latitude', place.latitude);
        form.setValue('longitude', place.longitude);
      }
    } else {
      // Clear location fields if selection is removed
      form.setValue('location', '');
      form.setValue('address', '');
      form.setValue('latitude', null);
      form.setValue('longitude', null);
      // Optionally clear currency too?
      // form.setValue('currency', null);
    }
  };
  // --- End Location Select Handler ---

  const onSubmit: SubmitHandler<ItineraryFormValues> = async (values) => {
    setIsLoading(true);
    console.log('Form submitted:', values);

    const apiEndpoint = isEditing
      ? API_ROUTES.ITINERARY_ITEM(tripId, initialData!.id)
      : API_ROUTES.TRIP_ITINERARY(tripId);

    const method = isEditing ? 'PUT' : 'POST';

    const payload = {
      ...values,
      date: values.date ? format(values.date, 'yyyy-MM-dd') : null,
      day_number: isEditing ? initialData?.day_number : dayNumber, // Pass dayNumber only when creating
      estimated_cost: values.estimated_cost ? Number(values.estimated_cost) : null,
      latitude: form.getValues('latitude') || null, // Add latitude
      longitude: form.getValues('longitude') || null, // Add longitude
    };

    console.log(`Calling API: \`${method} ${apiEndpoint}\`, payload`);

    try {
      // --- ACTUAL API Call ---
      const response = await fetch(apiEndpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `Failed to ${isEditing ? 'update' : 'add'} item: \`${response.status}\``
        );
      }

      const savedItemResult = await response.json();
      const savedItem = savedItemResult.item || savedItemResult;

      toast({ title: 'Success', description: `Itinerary item ${isEditing ? 'saved' : 'added'}.` });
      if (isEditing) {
        trackEvent('itinerary_item_updated', { itemId: savedItem.id, tripId });
        onSave(savedItem);
      } else if (onItemAdded) {
        trackEvent('itinerary_item_added', { itemId: savedItem.id, tripId });
        onItemAdded(savedItem);
      } else {
        console.warn('onItemAdded callback is missing'); // Warn if callback not provided
        onSave(savedItem);
      }
      onClose();
    } catch (error: any) {
      console.error(`Error ${isEditing ? 'saving' : 'adding'} item:`, error);
      toast({
        title: 'Error',
        description: error.message || `Failed to ${isEditing ? 'save' : 'add'} item.`,
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  return (
    <Form form={form} {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 px-4 pt-4 pb-6 h-full flex flex-col overflow-hidden"
      >
        <div className="flex-grow overflow-y-auto pr-3 space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                {' '}
                <FormLabel>Title*</FormLabel>{' '}
                <FormControl>
                  <Input
                    placeholder="e.g., Dinner at Le Diplomate"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>{' '}
                <FormMessage />{' '}
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl>
              <LocationSearch
                onLocationSelect={handleLocationSelect}
                // Use the `address` field for initial value if available,
                // otherwise fallback to `location` (primary name)
                initialValue={initialData?.address || initialData?.location || ''}
                placeholder="Search place or address"
                onClear={() => handleLocationSelect(null)} // Call handler with null on clear
              />
            </FormControl>
            {
              // Display selected address (now sourced from form.watch('address'))
              form.watch('address') && (
                <p className="text-xs text-muted-foreground pt-1 pl-1">{form.watch('address')}</p>
              )
            }
          </FormItem>
          {/* Hidden address input remains the same */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => <Input type="hidden" {...field} value={field.value ?? ''} />}
          />
          {/* Add hidden inputs for lat/lng */}
          <FormField
            control={form.control}
            name="latitude"
            render={({ field }) => <Input type="hidden" {...field} value={field.value ?? ''} />}
          />
          <FormField
            control={form.control}
            name="longitude"
            render={({ field }) => <Input type="hidden" {...field} value={field.value ?? ''} />}
          />

          <Collapsible open={showMoreOptions} onOpenChange={setShowMoreOptions}>
            <CollapsibleTrigger asChild>
              <Button
                variant="link"
                className="p-0 h-auto text-sm text-muted-foreground flex items-center"
              >
                {showMoreOptions ? (
                  <ChevronUp className="h-4 w-4 mr-1" />
                ) : (
                  <ChevronDown className="h-4 w-4 mr-1" />
                )}
                {showMoreOptions ? 'Hide extra details' : 'Add more details'}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-3">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                            disabled={isLoading}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        {' '}
                        <Calendar
                          mode="single"
                          selected={field.value ?? undefined}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date('1900-01-01')}
                          initialFocus
                        />{' '}
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_time"
                  render={({ field }) => (
                    <FormItem>
                      {' '}
                      <FormLabel>Start Time</FormLabel>{' '}
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          value={field.value ?? ''}
                          disabled={isLoading}
                        />
                      </FormControl>{' '}
                      <FormMessage />{' '}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="end_time"
                  render={({ field }) => (
                    <FormItem>
                      {' '}
                      <FormLabel>End Time</FormLabel>{' '}
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          value={field.value ?? ''}
                          disabled={isLoading}
                        />
                      </FormControl>{' '}
                      <FormMessage />{' '}
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    {' '}
                    <FormLabel>Category</FormLabel>{' '}
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue>Select a category</SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from(new Set(Object.values(ITINERARY_CATEGORIES))).map((cat) => (
                          <SelectItem key={cat} value={cat} className="capitalize">
                            {cat.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>{' '}
                    <FormMessage />{' '}
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="estimated_cost"
                  render={({ field }) => (
                    <FormItem>
                      {' '}
                      <FormLabel>Est. Cost</FormLabel>{' '}
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          {...field}
                          value={field.value ?? ''}
                          disabled={isLoading}
                        />
                      </FormControl>{' '}
                      <FormMessage />{' '}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      {' '}
                      <FormLabel>Currency</FormLabel>{' '}
                      <FormControl>
                        <Input
                          maxLength={3}
                          {...field}
                          value={field.value ?? ''}
                          disabled={isLoading}
                        />
                      </FormControl>{' '}
                      <FormMessage />{' '}
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any details, links, or reminders..."
                        className="resize-none"
                        {...field}
                        value={field.value ?? ''}
                        disabled={isLoading}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CollapsibleContent>
          </Collapsible>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Save Changes' : 'Add Item'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
