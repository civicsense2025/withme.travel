'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TABLES } from '@/utils/constants/database';
import { slugify } from '@/utils/text-utils'; // Create this utility if needed
import { useToast } from '@/lib/hooks/use-toast'
import { Loader } from 'lucide-react';

interface Destination {
  id: string;
  name: string;
}

interface CreateTemplateFormProps {
  destinations: Destination[];
}

export default function CreateTemplateForm({ destinations }: CreateTemplateFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    destination_id: '',
    duration_days: '3', // Default to 3 days
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Simple utility to generate a slug
  const generateSlug = (title: string) => {
    return slugify(title) || `template-${Date.now()}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form data
      if (!formData.title) {
        toast({
          title: 'Error',
          description: 'Template title is required',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      if (!formData.destination_id) {
        toast({
          title: 'Error',
          description: 'Please select a destination',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Generate a slug for the template
      const slug = generateSlug(formData.title);

      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create the template
      const { data, error } = await supabase
        .from(TABLES.ITINERARY_TEMPLATES)
        .insert({
          title: formData.title,
          description: formData.description,
          destination_id: formData.destination_id,
          duration_days: parseInt(formData.duration_days),
          slug,
          created_by: user.id,
          updated_at: new Date().toISOString(),
          is_featured: false,
          metadata: {
            created_in_admin: true,
          },
        })
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: 'Success',
        description: 'Template created successfully',
      });

      // Redirect to the edit page
      if (data && data[0]) {
        router.push(`/admin/itineraries/${slug}`);
      } else {
        router.push('/admin/itineraries');
      }
    } catch (error: any) {
      console.error('Error creating template:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create template',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Template Title*</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter a descriptive title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter a description of this itinerary template"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="destination_id">Destination*</Label>
              <Select
                value={formData.destination_id}
                onValueChange={(value) => handleSelectChange(value, 'destination_id')}
                required
              >
                <SelectTrigger>
                  <SelectValue>Select a destination</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {destinations.map((destination) => (
                    <SelectItem key={destination.id} value={destination.id}>
                      {destination.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_days">Number of Days</Label>
              <Input
                id="duration_days"
                name="duration_days"
                type="number"
                value={formData.duration_days}
                onChange={handleInputChange}
                min={1}
                max={30}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/itineraries')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Template'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
