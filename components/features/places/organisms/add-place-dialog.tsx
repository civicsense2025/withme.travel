/**
 * AddPlaceDialog Component
 * 
 * Dialog for adding a new place to a trip
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { usePlaces } from '@/lib/features/places/hooks';
import type { Place } from '@/components/features/places/types';

// ============================================================================
// FORM SCHEMA
// ============================================================================

const placeSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  category: z.enum(['restaurant', 'hotel', 'attraction', 'shopping', 'other'], {
    message: 'Please select a valid category'
  }),
  address: z.string().optional(),
  description: z.string().optional(),
  image_url: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
});

type PlaceFormValues = z.infer<typeof placeSchema>;

// ============================================================================
// COMPONENT
// ============================================================================

export interface AddPlaceDialogProps {
  /** Trip ID to add the place to */
  tripId: string;
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Function to call when the dialog should be closed */
  onClose: () => void;
  /** Function to call when a place is successfully added */
  onPlaceAdded?: (place: Place) => void;
}

/**
 * Dialog for adding a new place to a trip
 */
export function AddPlaceDialog({ 
  tripId, 
  isOpen, 
  onClose,
  onPlaceAdded 
}: AddPlaceDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addPlace } = usePlaces({ tripId });
  
  const form = useForm<PlaceFormValues>({
    resolver: zodResolver(placeSchema),
    defaultValues: {
      name: '',
      category: 'restaurant',
      address: '',
      description: '',
      image_url: '',
    },
  });

  const handleSubmit = async (values: PlaceFormValues) => {
    setIsSubmitting(true);
    try {
      const newPlace = await addPlace({
        name: values.name,
        category: values.category,
        address: values.address || '',
        description: values.description || '',
        image_url: values.image_url || '',
      });
      
      if (onPlaceAdded && newPlace) {
        onPlaceAdded(newPlace);
      }
      
      form.reset();
      onClose();
    } catch (error) {
      console.error('Failed to add place:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Place</DialogTitle>
        </DialogHeader>
        
        <Form form={form} onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter place name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <RadioGroup
                      name="category"
                      value={field.value}
                      onChange={field.onChange}
                      className="flex flex-wrap gap-4"
                    >
                      <RadioGroupItem value="restaurant" label="Restaurant" />
                      <RadioGroupItem value="hotel" label="Hotel" />
                      <RadioGroupItem value="attraction" label="Attraction" />
                      <RadioGroupItem value="shopping" label="Shopping" />
                      <RadioGroupItem value="other" label="Other" />
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter address (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter description (optional)" 
                      className="resize-none min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter image URL (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Place'}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 