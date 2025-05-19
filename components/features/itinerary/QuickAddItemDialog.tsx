'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ITINERARY_CATEGORIES } from '@/utils/constants/status';
import { CATEGORY_DISPLAY } from '@/utils/constants/ui/ui';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Suspense, lazy } from 'react';
import { API_ROUTES } from '@/utils/constants/routes';
import { TABLES } from '@/utils/constants/database';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy load geocoder to reduce initial bundle size
const MapboxGeocoderComponent = lazy(() => import('@/components/features/maps/MapboxGeocoder'));

// Use the same GeocoderResult interface as defined in mapbox-geocoder.tsx
interface GeocoderResult {
  geometry: { coordinates: [number, number]; type: string };
  place_name: string;
  text: string;
  id?: string;
  properties?: { address?: string };
  [key: string]: any;
}

// Form schema
const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  location: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface QuickAddItemDialogProps {
  tripId: string;
  isOpen: boolean;
  onClose: () => void;
  onItemAdded: () => void;
  defaultCategory?: string | null;
  title?: string;
  description?: string;
  dayNumber?: number | null;
}

export const QuickAddItemDialog: React.FC<QuickAddItemDialogProps> = ({
  tripId,
  isOpen,
  onClose,
  onItemAdded,
  defaultCategory = null,
  title = 'Add Unscheduled Item',
  description = 'Add another item to your unscheduled items list.',
  dayNumber = null,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [itemTitle, setItemTitle] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState(defaultCategory || '');
  const [geocoderResult, setGeocoderResult] = useState<GeocoderResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      category: defaultCategory || '',
      url: '',
      location: '',
    },
  });

  // Update form values when defaultCategory changes
  useEffect(() => {
    if (defaultCategory) {
      form.setValue('category', defaultCategory);
      setCategory(defaultCategory);
    }
  }, [defaultCategory, form]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      // Reset form state
      setItemTitle('');
      setItemDescription('');
      setLocation('');
      setGeocoderResult(null);
      setError(null);

      // Only keep category if provided as prop
      setCategory(defaultCategory || '');

      // Reset form
      form.reset({
        title: '',
        description: '',
        category: defaultCategory || '',
        url: '',
        location: '',
      });
    }
  }, [isOpen, form, defaultCategory]);

  const handleGeocoderResult = useCallback(
    (result: GeocoderResult | null) => {
      setGeocoderResult(result);
      if (result) {
        setLocation(result.text || result.place_name || '');
        form.setValue('location', result.text || result.place_name || '');
      }
    },
    [form]
  );

  const handleSubmit = async (e: React.FormEvent, keepOpen = false) => {
    e.preventDefault();

    if (!category) {
      setError('Type is required.');
      toast({
        title: 'Missing Info',
        description: 'Please select an item type.',
        variant: 'destructive',
      });
      return;
    }

    if (!itemTitle.trim()) {
      setError('Title is required.');
      toast({
        title: 'Missing Info',
        description: 'Please provide a title.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newItemData = {
        title: itemTitle.trim(),
        category: category,
        type: 'item',
        description: itemDescription,
        location: location,
        // Location details - only include if a place was selected
        ...(geocoderResult
          ? {
              place_name: geocoderResult.text || geocoderResult.place_name || '',
              address: geocoderResult.properties?.address || geocoderResult.place_name,
              mapbox_id: geocoderResult.id,
              latitude: geocoderResult.geometry?.coordinates[1],
              longitude: geocoderResult.geometry?.coordinates[0],
            }
          : {}),
        day_number: dayNumber,
      };

      const response = await fetch(API_ROUTES.TRIP_ITINERARY(tripId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItemData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to add item');
      }

      // Success - call the onItemAdded callback
      onItemAdded();

      // Show success message
      toast({
        title: 'Item Added!',
        description: getSuccessMessage(itemTitle),
      });

      // Reset form if keeping dialog open
      if (keepOpen) {
        setItemTitle('');
        setItemDescription('');
        setLocation('');
        setGeocoderResult(null);
        form.reset({
          title: '',
          description: '',
          category: category, // Keep the category
          url: '',
          location: '',
        });
      } else {
        // Close dialog if not keeping open
        onClose();
      }
    } catch (error: any) {
      console.error('Error adding item:', error);
      setError(error.message || 'Failed to add item');
      toast({
        title: 'Error',
        description: error.message || 'Failed to add item',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCategorySpecificTitle = useCallback(() => {
    if (category === ITINERARY_CATEGORIES.ACCOMMODATIONS) {
      return 'Add Accommodation';
    } else if (category === ITINERARY_CATEGORIES.TRANSPORTATION) {
      return 'Add Transportation';
    }
    return title;
  }, [category, title]);

  const getCategorySpecificDescription = useCallback(() => {
    if (category === ITINERARY_CATEGORIES.ACCOMMODATIONS) {
      return "Add where you'll be staying during your trip.";
    } else if (category === ITINERARY_CATEGORIES.TRANSPORTATION) {
      return "Add how you'll be getting around during your trip.";
    }
    return description;
  }, [category, description]);

  const getSuccessMessage = useCallback(
    (itemName: string) => {
      if (dayNumber === null) {
        return `${itemName} added to unscheduled items.${!geocoderResult ? ` Remember to set a location later.` : ''}`;
      } else {
        return `${itemName} added to Day ${dayNumber}.${!geocoderResult ? ` Remember to set a location later.` : ''}`;
      }
    },
    [dayNumber, geocoderResult]
  );

  // Memoize category options to prevent re-renders
  const categoryOptions = useMemo(() => {
    return Array.from(
      new Set([
        ITINERARY_CATEGORIES.ACCOMMODATIONS,
        ITINERARY_CATEGORIES.TRANSPORTATION,
        ITINERARY_CATEGORIES.FOOD_AND_DRINK,
        ITINERARY_CATEGORIES.CULTURAL_EXPERIENCES,
        ITINERARY_CATEGORIES.OUTDOOR_ADVENTURES,
        ITINERARY_CATEGORIES.ICONIC_LANDMARKS,
        ITINERARY_CATEGORIES.LOCAL_SECRETS,
        ITINERARY_CATEGORIES.NIGHTLIFE,
        ITINERARY_CATEGORIES.RELAXATION,
        ITINERARY_CATEGORIES.SHOPPING,
        ITINERARY_CATEGORIES.ENTERTAINMENT,
        ITINERARY_CATEGORIES.HEALTH_AND_WELLNESS,
        ITINERARY_CATEGORIES.EDUCATIONAL,
        ITINERARY_CATEGORIES.PHOTOGRAPHY,
        ITINERARY_CATEGORIES.OTHER,
        ITINERARY_CATEGORIES.FLEXIBLE_OPTIONS,
      ])
    );
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getCategorySpecificTitle()}</DialogTitle>
          <DialogDescription>{getCategorySpecificDescription()}</DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => handleSubmit(e)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title*</Label>
            <Input
              id="title"
              value={itemTitle}
              onChange={(e) => setItemTitle(e.target.value)}
              placeholder="e.g., Visit Museum"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type*</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="type">
                <SelectValue>
                  {category
                    ? CATEGORY_DISPLAY[category as keyof typeof CATEGORY_DISPLAY]?.label ||
                      'Select type'
                    : 'Select type'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <AnimatePresence>
                  {categoryOptions.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {CATEGORY_DISPLAY[cat as keyof typeof CATEGORY_DISPLAY]?.emoji}{' '}
                      {CATEGORY_DISPLAY[cat as keyof typeof CATEGORY_DISPLAY]?.label || cat}
                    </SelectItem>
                  ))}
                </AnimatePresence>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="location">Location</Label>
              <span className="text-xs text-muted-foreground">(Optional)</span>
            </div>
            <Suspense
              fallback={
                <div className="p-2 border rounded text-sm text-muted-foreground animate-pulse">
                  Loading location search...
                </div>
              }
            >
              <MapboxGeocoderComponent
                key={geocoderResult ? 'selected' : 'empty'}
                onResult={handleGeocoderResult}
                options={{
                  placeholder: 'Search for a place...',
                  marker: false,
                }}
              />
            </Suspense>
          </div>

          <motion.div
            className="space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              placeholder="Any additional details..."
            />
          </motion.div>

          {error && (
            <motion.div
              className="text-destructive text-sm p-2 border-l-2 border-destructive bg-destructive/5 rounded pl-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.div>
          )}

          <DialogFooter className="flex sm:justify-between">
            <Button type="button" variant="outline" onClick={() => onClose()} disabled={isLoading}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={isLoading}
                variant="secondary"
              >
                {isLoading ? (
                  <span className="flex items-center gap-1">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Adding...
                  </span>
                ) : (
                  'Add & Create Another'
                )}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-1">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Adding...
                  </span>
                ) : (
                  'Add Item'
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
