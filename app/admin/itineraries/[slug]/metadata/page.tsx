import { createServerComponentClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/database';
import { MetadataEditorClient } from '@/components/features/admin/metadata-editor-client';
import { ItineraryTemplate } from '@/types/itinerary';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function ItineraryMetadataAdminPage({ params }: PageProps) {
  const { slug } = params;

  // Fetch template data
  const supabase = await createServerComponentClient();
  const { data: template, error } = await supabase
    .from(TABLES.ITINERARY_TEMPLATES)
    .select('id, title, metadata, slug')
    .eq('slug', slug)
    .single();

  if (error || !template) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Metadata: {template.title}</h1>

      <div className="bg-card rounded-lg shadow-md p-6">
        <MetadataEditorClient template={template as ItineraryTemplate} />
      </div>
    </div>
  );
}
