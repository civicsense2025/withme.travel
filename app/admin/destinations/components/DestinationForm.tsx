'use client';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { TABLES } from '@/utils/constants/tables';

interface Destination {
  id: string;
  name: string;
  slug?: string;
  city?: string;
  country: string;
  continent: string;
  description?: string;
  short_description?: string;
  image_url?: string;
  popularity?: number;
  likes_count?: number;
  is_active?: boolean;
  [key: string]: any;
}

interface DestinationFormProps {
  initialData?: Destination;
}

export default function DestinationForm({ initialData }: DestinationFormProps) {
  const isEditing = !!initialData;
  const [formData, setFormData] = useState<Destination>(
    initialData || {
      id: '',
      name: '',
      slug: '',
      city: '',
      country: '',
      continent: '',
      description: '',
      short_description: '',
      image_url: '',
      popularity: 0,
      likes_count: 0,
      is_active: true,
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // List of continents for the dropdown
  const continents = [
    'Africa',
    'Antarctica',
    'Asia',
    'Europe',
    'North America',
    'Oceania',
    'South America',
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    // Handle checkboxes
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    // Handle numbers
    if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
      return;
    }

    // Handle regular inputs
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with a single one
      .trim(); // Remove whitespace from both ends
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      // Only auto-generate slug if it's empty or if we're creating a new destination
      slug: !prev.slug || !isEditing ? generateSlug(name) : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Make sure required fields are present
      if (!formData.name || !formData.country || !formData.continent) {
        throw new Error('Name, country, and continent are required fields');
      }

      if (!formData.slug) {
        formData.slug = generateSlug(formData.name);
      }

      let result;

      if (isEditing) {
        // Update existing destination
        result = await supabase.from(TABLES.DESTINATIONS).update(formData).eq('id', formData.id);
      } else {
        // Create new destination
        result = await supabase.from(TABLES.DESTINATIONS).insert(formData).select('id').single();
      }

      if (result.error) throw result.error;

      setSuccess(
        isEditing ? 'Destination updated successfully!' : 'Destination created successfully!'
      );

      // Refresh the page to reflect changes
      router.refresh();

      // For new destinations, redirect to the edit page after creation
      if (!isEditing && result.data?.id) {
        setTimeout(() => {
          router.push(`/admin/destinations/${result.data.id}`);
        }, 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error saving destination:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-4 rounded-md mb-4">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleNameChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium">
            Slug
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            URL-friendly version of the name. Auto-generated if left empty.
          </p>
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium">
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium">
            Country *
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="continent" className="block text-sm font-medium">
            Continent *
          </label>
          <select
            id="continent"
            name="continent"
            value={formData.continent}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select a continent</option>
            {continents.map((continent) => (
              <option key={continent} value={continent}>
                {continent}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="popularity" className="block text-sm font-medium">
            Popularity Score
          </label>
          <input
            type="number"
            id="popularity"
            name="popularity"
            value={formData.popularity || 0}
            onChange={handleChange}
            min="0"
            max="100"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Ranking from 0-100, with 100 being most popular
          </p>
        </div>

        <div>
          <label htmlFor="image_url" className="block text-sm font-medium">
            Image URL
          </label>
          <input
            type="url"
            id="image_url"
            name="image_url"
            value={formData.image_url || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm">Active (visible to users)</span>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="short_description" className="block text-sm font-medium">
          Short Description
        </label>
        <textarea
          id="short_description"
          name="short_description"
          value={formData.short_description || ''}
          onChange={handleChange}
          rows={2}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Brief overview, displayed in search results and cards
        </p>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Full Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          rows={6}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.push('/admin/destinations')}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? isEditing
              ? 'Updating...'
              : 'Creating...'
            : isEditing
              ? 'Update Destination'
              : 'Create Destination'}
        </button>
      </div>
    </form>
  );
}
