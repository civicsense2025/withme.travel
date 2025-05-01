'use client';

import React, { useState, useEffect, Suspense, lazy } from 'react';
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
import { useToast } from '@/components/ui/use-toast';
import { ITINERARY_CATEGORIES } from '@/utils/constants/status';
import { CATEGORY_DISPLAY } from '@/utils/constants/ui';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Dynamically import the MapboxGeocoderComponent to prevent it from being loaded unnecessarily
const MapboxGeocoderComponent = lazy(() => import('@/components/maps/mapbox-geocoder'));

// Define GeocoderResult interface
interface GeocoderResult {
  geometry: { coordinates: [number, number]; type: string };
  place_name: string;
  text: string;
  id?: string; // Mapbox ID
  properties?: { address?: string };
  context?: any;
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
  onOpenChange: (open: boolean) => void;
  onItemAdded: () => void;
  defaultCategory?: string | null;
  dialogTitle?: string;
  dialogDescription?: string;
}

export const QuickAddItemDialog: React.FC<QuickAddItemDialogProps> = ({ 
  tripId, 
  isOpen, 
  onOpenChange, 
  onItemAdded,
  defaultCategory = null,
  dialogTitle = "Add Unscheduled Item",
  dialogDescription = "Add another item to your unscheduled items list."
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
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
    }
  }, [defaultCategory, form]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      // Only reset specific fields, keep category if it's set
      form.reset({
        title: '',
        description: '',
        category: defaultCategory || form.getValues('category') || '',
        url: '',
        location: '',
      });
    }
  }, [isOpen, form, defaultCategory]);

  const handleGeocoderResult = (result: GeocoderResult | null) => {
    setGeocoderResult(result);
    if (result) {
      form.setValue('location', result.text || result.place_name || '');
    }
  };

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
    
    setIsLoading(true);
    setError(null);

    const newItemData = {
      title: title || 'Untitled Itinerary Item', 
      type: category,
      description: description,
      location: location,
      // Location details - only include if a place was selected
      ...(geocoderResult ? {
        place_name: geocoderResult.text || geocoderResult.place_name || '',
        address: geocoderResult.properties?.address || geocoderResult.place_name,
        mapbox_id: geocoderResult.id,
        latitude: geocoderResult.geometry?.coordinates[1],
        longitude: geocoderResult.geometry?.coordinates[0],
      } : {}),
      day_number: null, // Unscheduled item
    };

    try {
      const response = await fetch(`/api/trips/${tripId}/itinerary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItemData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add item.');
      }

      // Item was successfully added
      const itemName = newItemData.title;
      toast({ 
        title: 'Item Added!', 
        description: `${itemName} added to unscheduled items.${!geocoderResult ? ' Remember to set a location later.' : ''}` 
      });
      
      onItemAdded(); // Refresh the itinerary items
      
      if (keepOpen) {
        // Reset form but keep dialog open for another item
        form.reset();
        // Keep the category if it was pre-selected
        if (defaultCategory) {
          setCategory(defaultCategory);
        }
      } else {
        // Close dialog
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error('Failed to add quick itinerary item:', error);
      setError(typeof error === 'string' ? error : error.message || 'An error occurred');
      toast({ 
        title: 'Failed to Add', 
        description: typeof error === 'string' ? error : error.message || 'An error occurred', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get appropriate title and description based on the selected category
  const getCategorySpecificTitle = () => {
    if (category === ITINERARY_CATEGORIES.ACCOMMODATIONS) {
      return "Add Accommodation";
    } else if (category === ITINERARY_CATEGORIES.TRANSPORTATION) {
      return "Add Transportation";
    }
    return dialogTitle;
  };

  const getCategorySpecificDescription = () => {
    if (category === ITINERARY_CATEGORIES.ACCOMMODATIONS) {
      return "Add where you'll be staying during your trip.";
    } else if (category === ITINERARY_CATEGORIES.TRANSPORTATION) {
      return "Add how you'll be getting around during your trip.";
    }
    return dialogDescription;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getCategorySpecificTitle()}</DialogTitle>
          <DialogDescription>
            {getCategorySpecificDescription()}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={(e) => handleSubmit(e)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title*</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g., Visit Museum"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="type">
                <SelectValue>
                  {category ? 
                    CATEGORY_DISPLAY[category as keyof typeof CATEGORY_DISPLAY]?.label || "Select type" : 
                    "Select type"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ITINERARY_CATEGORIES.ACCOMMODATIONS}>
                  {CATEGORY_DISPLAY[ITINERARY_CATEGORIES.ACCOMMODATIONS].emoji} {CATEGORY_DISPLAY[ITINERARY_CATEGORIES.ACCOMMODATIONS].label}
                </SelectItem>
                <SelectItem value={ITINERARY_CATEGORIES.TRANSPORTATION}>
                  {CATEGORY_DISPLAY[ITINERARY_CATEGORIES.TRANSPORTATION].emoji} {CATEGORY_DISPLAY[ITINERARY_CATEGORIES.TRANSPORTATION].label}
                </SelectItem>
                <SelectItem value={ITINERARY_CATEGORIES.FOOD_DRINK}>
                  {CATEGORY_DISPLAY[ITINERARY_CATEGORIES.FOOD_DRINK].emoji} {CATEGORY_DISPLAY[ITINERARY_CATEGORIES.FOOD_DRINK].label}
                </SelectItem>
                <SelectItem value={ITINERARY_CATEGORIES.ICONIC_LANDMARKS}>
                  {CATEGORY_DISPLAY[ITINERARY_CATEGORIES.ICONIC_LANDMARKS].emoji} {CATEGORY_DISPLAY[ITINERARY_CATEGORIES.ICONIC_LANDMARKS].label}
                </SelectItem>
                <SelectItem value={ITINERARY_CATEGORIES.LOCAL_SECRETS}>
                  {CATEGORY_DISPLAY[ITINERARY_CATEGORIES.LOCAL_SECRETS].emoji} {CATEGORY_DISPLAY[ITINERARY_CATEGORIES.LOCAL_SECRETS].label}
                </SelectItem>
                <SelectItem value={ITINERARY_CATEGORIES.CULTURAL_EXPERIENCES}>
                  {CATEGORY_DISPLAY[ITINERARY_CATEGORIES.CULTURAL_EXPERIENCES].emoji} {CATEGORY_DISPLAY[ITINERARY_CATEGORIES.CULTURAL_EXPERIENCES].label}
                </SelectItem>
                <SelectItem value={ITINERARY_CATEGORIES.OUTDOOR_ADVENTURES}>
                  {CATEGORY_DISPLAY[ITINERARY_CATEGORIES.OUTDOOR_ADVENTURES].emoji} {CATEGORY_DISPLAY[ITINERARY_CATEGORIES.OUTDOOR_ADVENTURES].label}
                </SelectItem>
                <SelectItem value={ITINERARY_CATEGORIES.NIGHTLIFE}>
                  {CATEGORY_DISPLAY[ITINERARY_CATEGORIES.NIGHTLIFE].emoji} {CATEGORY_DISPLAY[ITINERARY_CATEGORIES.NIGHTLIFE].label}
                </SelectItem>
                <SelectItem value={ITINERARY_CATEGORIES.RELAXATION}>
                  {CATEGORY_DISPLAY[ITINERARY_CATEGORIES.RELAXATION].emoji} {CATEGORY_DISPLAY[ITINERARY_CATEGORIES.RELAXATION].label}
                </SelectItem>
                <SelectItem value={ITINERARY_CATEGORIES.SHOPPING}>
                  {CATEGORY_DISPLAY[ITINERARY_CATEGORIES.SHOPPING].emoji} {CATEGORY_DISPLAY[ITINERARY_CATEGORIES.SHOPPING].label}
                </SelectItem>
                <SelectItem value={ITINERARY_CATEGORIES.DAY_EXCURSIONS}>
                  {CATEGORY_DISPLAY[ITINERARY_CATEGORIES.DAY_EXCURSIONS].emoji} {CATEGORY_DISPLAY[ITINERARY_CATEGORIES.DAY_EXCURSIONS].label}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="location">Location</Label>
              <span className="text-xs text-muted-foreground">(Optional)</span>
            </div>
            <Suspense fallback={<div className="p-2 border rounded text-sm text-muted-foreground">Loading location search...</div>}>
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
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Any additional details..."
            />
          </div>
          
          {error && (
            <div className="text-destructive text-sm">{error}</div>
          )}
          
          <DialogFooter className="flex sm:justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={(e) => handleSubmit(e, false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button 
                type="button" 
                onClick={(e) => handleSubmit(e, true)}
                disabled={isLoading}
                variant="secondary"
              >
                {isLoading ? 'Adding...' : 'Add & Create Another'}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Item'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 