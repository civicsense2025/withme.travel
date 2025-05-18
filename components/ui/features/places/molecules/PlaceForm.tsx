/**
 * PlaceForm Component
 * 
 * A form for creating and editing place data
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { CreatePlaceData } from '@/lib/client/places';

// ============================================================================
// TYPES & SCHEMA
// ============================================================================

export interface PlaceFormProps {
  /** Destination ID for the place */
  destinationId: string;
  /** Initial data for editing */
  initialData?: Partial<CreatePlaceData>;
  /** Handler for form submission */
  onSubmit: (data: CreatePlaceData) => Promise<void>;
  /** Handler for cancel action */
  onCancel?: () => void;
  /** Whether the form is in a loading state */
  isLoading?: boolean;
}

// Validation schema for place data
const placeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  address: z.string().optional(),
  price_level: z.coerce.number().min(1).max(4).optional().nullable(),
  destination_id: z.string().min(1, 'Destination ID is required'),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  website: z.string().url().optional().or(z.literal('')).nullable(),
  phone_number: z.string().optional().nullable(),
});

// Type for form data based on Zod schema
type PlaceFormData = z.infer<typeof placeSchema>;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Form for creating and editing places
 */
export function PlaceForm({
  destinationId,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: PlaceFormProps) {
  const [categories, setCategories] = useState<string[]>([
    'restaurant',
    'cafe',
    'hotel',
    'landmark',
    'attraction',
    'shopping',
    'transport',
    'other'
  ]);

  // Initialize form with defaults or initial data
  const form = useForm<PlaceFormData>({
    resolver: zodResolver(placeSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      category: initialData?.category || '',
      address: initialData?.address || '',
      price_level: initialData?.price_level || null,
      destination_id: destinationId,
      latitude: initialData?.latitude || null,
      longitude: initialData?.longitude || null,
      website: initialData?.website || '',
      phone_number: initialData?.phone_number || '',
    },
  });

  // Handle form submission
  const handleSubmit = async (data: PlaceFormData) => {
    // Convert empty strings to null
    const processedData = Object.entries(data).reduce((acc, [key, value]) => {
      // @ts-ignore - we're processing dynamically
      acc[key] = value === '' ? null : value;
      return acc;
    }, {} as CreatePlaceData);
    
    await onSubmit(processedData as CreatePlaceData);
  };

  return (
    <Form form={form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Hidden destination ID field */}
        <input type="hidden" name="destination_id" value={destinationId} />

        {/* Place name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name*</FormLabel>
              <FormControl>
                <Input placeholder="Place name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category*</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe this place" 
                  {...field} 
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Address */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Physical address" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Price level */}
        <FormField
          control={form.control}
          name="price_level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price Level</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(value ? parseInt(value) : null)} 
                defaultValue={field.value?.toString() || ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select price level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Not specified</SelectItem>
                  <SelectItem value="1">$ (Inexpensive)</SelectItem>
                  <SelectItem value="2">$$ (Moderate)</SelectItem>
                  <SelectItem value="3">$$$ (Expensive)</SelectItem>
                  <SelectItem value="4">$$$$ (Very Expensive)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Website */}
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input 
                  type="url" 
                  placeholder="https://example.com" 
                  {...field} 
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone number */}
        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input 
                  type="tel" 
                  placeholder="+1 555-123-4567" 
                  {...field} 
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Coordinates (advanced, could be hidden under an "Advanced" section) */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="any" 
                    placeholder="40.7128" 
                    {...field}
                    value={field.value === null ? '' : field.value}
                    onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="longitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="any" 
                    placeholder="-74.0060" 
                    {...field}
                    value={field.value === null ? '' : field.value}
                    onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Form actions */}
        <div className="flex justify-end gap-2 pt-2">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData?.name ? 'Update Place' : 'Create Place'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 