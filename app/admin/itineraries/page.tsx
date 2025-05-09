import { redirect } from 'next/navigation';
import { Container } from '@/components/container';
import { checkAdminAuth } from '../utils/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ItineraryTemplatesTable from './ItineraryTemplatesTable';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { TABLES } from '@/utils/constants/tables';

export const metadata = {
  title: 'Itineraries Management | Admin Panel',
  description: 'Manage itinerary templates and configurations on withme.travel',
};

export default async function AdminItinerariesPage() {
  const { isAdmin, supabase, error } = await checkAdminAuth();

  if (!isAdmin) {
    redirect('/login?redirectTo=/admin/itineraries');
  }

  if (!supabase) {
    redirect('/login?error=supabase_client_error');
  }

  // Get counts for different itinerary types
  const { count: templateCount } = await supabase
    .from(TABLES.ITINERARY_TEMPLATES)
    .select('*', { count: 'exact', head: true });

  const { data: featuredTemplates, error: featuredError } = await supabase
    .from(TABLES.ITINERARY_TEMPLATES)
    .select('*')
    .eq('is_featured', true)
    .limit(5);

  // Get all templates for the initial data load (limited to 20)
  const { data: templates, error: templatesError } = await supabase
    .from(TABLES.ITINERARY_TEMPLATES)
    .select(`
      id,
      title,
      slug,
      destination_id,
      destinations:destination_id (
        name
      ),
      duration_days,
      created_at,
      updated_at,
      created_by
    `)
    .order('updated_at', { ascending: false })
    .limit(20);

  if (templatesError) {
    console.error('Error fetching templates:', templatesError);
    console.error('Error details:', {
      message: templatesError.message,
      hint: templatesError.hint,
      code: templatesError.code,
      details: templatesError.details
    });
  }

  // Fetch all sections for these templates
  const templateIds = (templates || []).map(t => t.id);
  let sections: any[] = [];
  if (templateIds.length > 0) {
    const { data: fetchedSections, error: sectionsError } = await supabase
      .from(TABLES.ITINERARY_TEMPLATE_SECTIONS)
      .select('*')
      .in('template_id', templateIds);
    if (sectionsError) {
      console.error('Error fetching template sections:', sectionsError);
    }
    sections = fetchedSections || [];
  }

  // Count the total number of template sections and items
  const { count: sectionsCount } = await supabase
    .from(TABLES.ITINERARY_TEMPLATE_SECTIONS)
    .select('*', { count: 'exact', head: true });

  const { count: itemsCount } = await supabase
    .from(TABLES.ITINERARY_TEMPLATE_ITEMS)
    .select('*', { count: 'exact', head: true });

  return (
    <Container>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Itineraries Management</h1>
          <p className="text-gray-500 mt-2">
            Manage itinerary templates and configurations
          </p>
        </div>
        <Link href="/admin/itineraries/create">
          <Button>Create Template</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Total Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{templateCount || 0}</div>
            <p className="text-sm text-gray-500">Across all destinations</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Featured Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{featuredTemplates?.length || 0}</div>
            <p className="text-sm text-gray-500">Highlighted on the platform</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Template Sections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{sectionsCount || 0}</div>
            <p className="text-sm text-gray-500">Days in all templates</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Template Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{itemsCount || 0}</div>
            <p className="text-sm text-gray-500">Activities across all templates</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <ItineraryTemplatesTable
            initialData={(templates || []).map(t => ({
              ...t,
              slug: t.slug ?? '',
              destinations:
                'destinations' in t &&
                t.destinations &&
                typeof t.destinations === 'object' &&
                t.destinations !== null &&
                'name' in t.destinations
                  ? {
                      city: null,
                      country: null,
                      name: (t.destinations as any).name ?? null,
                    }
                  : { city: null, country: null, name: null },
              created_at: t.created_at ?? '',
              updated_at: t.updated_at ?? '',
            }))}
            totalCount={templateCount || 0}
            sections={sections}
          />
        </TabsContent>
        
        <TabsContent value="featured">
          <ItineraryTemplatesTable
            initialData={(featuredTemplates || []).map(t => ({
              ...t,
              slug: t.slug ?? '',
              destinations:
                'destinations' in t &&
                t.destinations &&
                typeof t.destinations === 'object' &&
                t.destinations !== null &&
                'name' in t.destinations
                  ? {
                      city: null,
                      country: null,
                      name: (t.destinations as any).name ?? null,
                    }
                  : { city: null, country: null, name: null },
              created_at: t.created_at ?? '',
              updated_at: t.updated_at ?? '',
            }))}
            totalCount={featuredTemplates?.length || 0}
            sections={sections}
          />
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Template Settings</CardTitle>
              <CardDescription>Global settings for itinerary templates</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                Configure global settings for itinerary templates, including:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 mb-4">
                <li>Default visibility settings</li>
                <li>Template categories and tags</li>
                <li>Featured template selection criteria</li>
                <li>Template validation rules</li>
              </ul>
              <div className="flex justify-end">
                <Button variant="outline">Edit Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Container>
  );
} 