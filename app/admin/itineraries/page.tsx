import React from 'react';
import ItineraryTemplatesTable from './ItineraryTemplatesTable';
import ItinerariesTable from './ItinerariesTable';
import { createServerComponentClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Info } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface AdminItineraryPageProps {
  searchParams: {
    show?: string;
  };
}

/**
 * Fetch itinerary templates for the templates table
 */
async function fetchTemplates() {
  const supabase = await createServerComponentClient();

  try {
    const { data, error } = await supabase
      .from(TABLES.ITINERARY_TEMPLATES)
      .select(
        `
        id,
        title,
        slug,
        description,
        destination_id,
        created_by,
        created_at,
        is_published,
        destinations (
          id,
          name,
          city,
          country
        ),
        profiles:created_by (
          id,
          username,
          name
        )
      `
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }

    console.log(`Successfully fetched ${data?.length || 0} templates`);
    if (data && data.length > 0) {
      console.log('First template sample:', {
        id: data[0].id,
        title: data[0].title,
      });
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    return [];
  }
}

/**
 * Fetch sections for all templates
 */
async function fetchSections() {
  const supabase = await createServerComponentClient();

  try {
    console.log(`Fetching all template sections`);
    const { data, error } = await supabase
      .from(TABLES.ITINERARY_TEMPLATE_SECTIONS)
      .select('*')
      .order('day_number', { ascending: true });

    if (error) {
      console.error(`Error fetching sections:`, error);
      return [];
    }

    console.log(`Found ${data?.length || 0} total sections`);
    return data || [];
  } catch (error) {
    console.error(`Error in fetchSections:`, error);
    return [];
  }
}

/**
 * Fetch items for all sections
 */
async function fetchItems() {
  const supabase = await createServerComponentClient();
  try {
    console.log(`Fetching all template items`);
    const { data, error } = await supabase
      .from(TABLES.ITINERARY_TEMPLATE_ITEMS)
      .select('*')
      .order('day', { ascending: true })
      .order('position', { ascending: true });
    if (error) {
      console.error(`Error fetching items:`, error);
      return [];
    }
    console.log(`Found ${data?.length || 0} total items`);
    return data || [];
  } catch (error) {
    console.error(`Error in fetchItems:`, error);
    return [];
  }
}

/**
 * Admin Itineraries Page - Shows itinerary templates and published itineraries
 */
export default async function AdminItinerariesPage({ searchParams }: AdminItineraryPageProps) {
  const params = await searchParams;
  const activeTab = params.show || 'templates';
  const templates = await fetchTemplates();
  const sections = await fetchSections();
  const items = await fetchItems();

  // Nest items under their corresponding sections
  const sectionsWithItems = sections.map((section: any) => ({
    ...section,
    items: items.filter((item: any) => {
      // section.id can be string or number, item.section_id can be string or number
      return String(item.section_id) === String(section.id);
    }),
  }));

  console.log('Fetching templates using table:', TABLES.ITINERARY_TEMPLATES);
  console.log('Fetching sections using table:', TABLES.ITINERARY_TEMPLATE_SECTIONS);
  console.log('Template count:', templates.length);
  console.log('Total sections count:', sections.length);

  // Count the templates by their published status
  const publishedCount = templates.filter((t: any) => t.is_published).length;
  const draftCount = templates.filter((t: any) => !t.is_published).length;

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Itinerary Management</h1>
        <Link href="/admin/itineraries/create">
          <Button>Create New Template</Button>
        </Link>
      </div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info size={18} />
            Table Name Reference
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Template table is using:{' '}
            <code className="bg-white dark:bg-black p-1 rounded">{TABLES.ITINERARY_TEMPLATES}</code>
          </p>
          <p>
            Template sections table is using:{' '}
            <code className="bg-white dark:bg-black p-1 rounded">
              {TABLES.ITINERARY_TEMPLATE_SECTIONS}
            </code>
          </p>
          <p>
            Template items table is using:{' '}
            <code className="bg-white dark:bg-black p-1 rounded">
              {TABLES.ITINERARY_TEMPLATE_ITEMS}
            </code>
          </p>
        </CardContent>
      </Card>
      <Alert className="mb-6">
        <AlertTitle>Template Management</AlertTitle>
        <AlertDescription>
          This section allows you to manage itinerary templates that users can apply to their trips.
          Templates can be created, edited, and published for users to discover.
        </AlertDescription>
      </Alert>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-4">
          <Card className="w-60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{templates.length}</div>
            </CardContent>
          </Card>
          <Card className="w-60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{publishedCount}</div>
            </CardContent>
          </Card>
          <Card className="w-60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{draftCount}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue={activeTab} className="w-full">
          <TabsList>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="itineraries">Published Itineraries</TabsTrigger>
          </TabsList>
          <TabsContent value="templates" className="py-4">
            <ItineraryTemplatesTable
              initialData={templates as any}
              totalCount={templates.length}
              sectionsWithItems={sectionsWithItems}
            />
          </TabsContent>
          <TabsContent value="itineraries" className="py-4">
            <ItinerariesTable initialData={[]} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
