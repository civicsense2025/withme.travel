import { redirect } from 'next/navigation';
import { Container } from '@/components/container';
import { checkAdminAuth } from '../../utils/auth';
import { TABLES } from '@/utils/constants/tables';
import { notFound } from 'next/navigation';
import TemplateEditor from '../components/TemplateEditor';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, MapPin, Pencil } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/utils/text-utils';
import type { TemplateData } from '../types';

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function TemplateDetailPage(props: PageProps) {
  const params = await props.params;
  const { slug } = params;
  const { isAdmin, supabase, error } = await checkAdminAuth();

  if (!isAdmin) {
    redirect('/login?redirectTo=/admin/itineraries');
  }

  if (!supabase) {
    redirect('/login?error=supabase_client_error');
  }

  // Get the template data
  const { data: template, error: templateError } = await supabase
    .from(TABLES.ITINERARY_TEMPLATES)
    .select(
      `
      id,
      title,
      slug,
      description,
      destination_id,
      destinations:destination_id (
        id,
        name
      ),
      duration_days,
      created_at,
      updated_at,
      created_by,
      metadata,
      cover_image_url
    `
    )
    .eq('slug', slug)
    .single();

  if (templateError || !template) {
    console.error('Error fetching template:', templateError);
    notFound();
  }

  // Get all destinations for the dropdown
  const { data: destinations, error: destinationsError } = await supabase
    .from(TABLES.DESTINATIONS)
    .select('id, name')
    .order('name');

  if (destinationsError) {
    console.error('Error fetching destinations:', destinationsError);
  }

  // Get template sections
  const { data: sections, error: sectionsError } = await supabase
    .from(TABLES.ITINERARY_TEMPLATE_SECTIONS)
    .select('*')
    .eq('template_id', template.id)
    .order('day_number', { ascending: true });

  if (sectionsError) {
    console.error('Error fetching template sections:', sectionsError);
  }

  // Get template items
  const { data: items, error: itemsError } = await supabase
    .from(TABLES.ITINERARY_TEMPLATE_ITEMS)
    .select('*')
    .eq('template_id', template.id)
    .order('day', { ascending: true })
    .order('position', { ascending: true });

  if (itemsError) {
    console.error('Error fetching template items:', itemsError);
  }

  // Defensive mapping for types
  let safeDestinationsObj: TemplateData['destinations'] = null;
  const destinationsArray = Array.isArray(template.destinations) ? template.destinations : [];
  const firstDest = destinationsArray[0];
  if (
    destinationsArray.length > 0 &&
    typeof firstDest === 'object' &&
    firstDest !== null &&
    'id' in firstDest &&
    'name' in firstDest
  ) {
    safeDestinationsObj = { ...firstDest, name: (firstDest as any).name ?? '' };
  } else {
    safeDestinationsObj = null;
  }

  const safeTemplate: TemplateData = {
    ...template,
    slug: template.slug ?? '',
    description: template.description ?? '',
    cover_image_url: template.cover_image_url ?? '',
    destinations: safeDestinationsObj,
    created_at: template.created_at ?? '',
    updated_at: template.updated_at ?? '',
    metadata:
      typeof template.metadata === 'object' && template.metadata !== null
        ? template.metadata
        : undefined,
  };

  const safeDestinations = (destinations || []).map((d: any) => ({
    id: d.id,
    name: d.name ?? '',
  }));

  const safeSections = (sections || []).map((s: any) => ({
    ...s,
    title: s.title ?? '',
  }));

  const safeItems = (items || []).map((item: any) => ({
    ...item,
    section_id:
      typeof item.section_id === 'number' && item.section_id !== null
        ? String(item.section_id)
        : (item.section_id ?? ''),
  }));

  // Organize items by section/day for easier display
  const itemsByDay: Record<number, any[]> = {};
  safeItems.forEach((item) => {
    const day = item.day || 1;
    if (!itemsByDay[day]) {
      itemsByDay[day] = [];
    }
    itemsByDay[day].push(item);
  });

  return (
    <Container>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Template: {safeTemplate.title}</h1>
          <Link href={`/admin/itineraries/${safeTemplate.slug}/metadata`}>
            <Button>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Template
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Template Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {safeTemplate.cover_image_url && (
                  <div className="relative w-full h-48 mb-4 rounded-md overflow-hidden">
                    <Image
                      src={safeTemplate.cover_image_url}
                      alt={safeTemplate.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Destination</h3>
                  <p className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                    {safeTemplate.destinations?.name || 'No destination'}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                  <p className="flex items-center mt-1">
                    <CalendarDays className="h-4 w-4 mr-1 text-gray-400" />
                    {safeTemplate.duration_days || '?'} days
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                  <p className="mt-1">
                    {safeTemplate.updated_at
                      ? formatDate(safeTemplate.updated_at, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Never'}
                  </p>
                </div>

                {safeTemplate.description && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Description</h3>
                    <p className="mt-1 text-sm">{safeTemplate.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column - Sections and items */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Itinerary Content</CardTitle>
                <CardDescription>
                  {safeSections.length} days, {safeItems.length} activities
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <Tabs defaultValue="day-1" className="w-full">
                  <TabsList className="px-6 py-2 overflow-x-auto flex w-full justify-start space-x-2">
                    {safeSections.map((section) => (
                      <TabsTrigger
                        key={section.id}
                        value={`day-${section.day_number}`}
                        className="flex-shrink-0"
                      >
                        Day {section.day_number}
                      </TabsTrigger>
                    ))}
                    {safeSections.length === 0 && (
                      <div className="px-4 py-2 text-sm text-gray-500">No days defined</div>
                    )}
                  </TabsList>

                  {safeSections.map((section) => (
                    <TabsContent
                      key={section.id}
                      value={`day-${section.day_number}`}
                      className="px-6 py-4"
                    >
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold">
                          Day {section.day_number}: {section.title}
                        </h3>
                        {section.date && <p className="text-sm text-gray-500">{section.date}</p>}
                      </div>

                      {(itemsByDay[section.day_number] || []).length > 0 ? (
                        <div className="space-y-6">
                          {(itemsByDay[section.day_number] || []).map((item, index) => (
                            <div key={item.id} className="border rounded-lg p-4 relative">
                              <div className="flex items-start">
                                <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0 mr-4">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium">{item.title}</h4>
                                  {item.description && (
                                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                  )}
                                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                                    {(item.start_time || item.end_time) && (
                                      <span className="flex items-center">
                                        <Clock className="h-4 w-4 mr-1" />
                                        {item.start_time && item.end_time
                                          ? `${item.start_time} - ${item.end_time}`
                                          : item.start_time || item.end_time}
                                      </span>
                                    )}
                                    {item.location && (
                                      <span className="flex items-center">
                                        <MapPin className="h-4 w-4 mr-1" />
                                        {item.location}
                                      </span>
                                    )}
                                    {item.category && (
                                      <Badge variant="outline" className="ml-1">
                                        {item.category}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-8 text-center text-gray-500">
                          <p>No activities for this day</p>
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        <TemplateEditor template={safeTemplate} />
      </div>
    </Container>
  );
}
