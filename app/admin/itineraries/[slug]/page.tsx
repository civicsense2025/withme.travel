import { redirect } from 'next/navigation';
import { Container } from '@/components/container';
import { checkAdminAuth } from '../../utils/auth';
import { TABLES } from '@/utils/constants/tables';
import { notFound } from 'next/navigation';
import TemplateEditor from '../components/TemplateEditor';

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
    .select(`
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
    `)
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
    .order('day_number', { ascending: true })
    .order('position', { ascending: true });

  if (itemsError) {
    console.error('Error fetching template items:', itemsError);
  }

  // Defensive mapping for types
  const safeTemplate = {
    ...template,
    slug: template.slug ?? '',
    description: template.description ?? '',
    cover_image_url: template.cover_image_url ?? '',
    destinations: template.destinations
      ? { ...template.destinations, name: template.destinations.name ?? '' }
      : { id: '', name: '' },
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
        : item.section_id ?? '',
  }));

  return (
    <Container>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Edit Template: {safeTemplate.title}</h1>
        </div>
        <TemplateEditor
          template={safeTemplate}
          destinations={safeDestinations}
          sections={safeSections}
          items={safeItems}
        />
      </div>
    </Container>
  );
} 