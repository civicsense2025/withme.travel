import { redirect } from 'next/navigation';
import { checkAdminAuth } from '../../../utils/auth';
import { TABLES } from '@/utils/constants/database';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditTemplateRedirectPage({ params }: PageProps) {
  const { id } = params;
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
    .select(`slug`)
    .eq('id', id)
    .single();

  if (templateError) {
    console.error('Error fetching template:', templateError);
    redirect('/admin/itineraries');
  }

  // Redirect to the slug-based URL
  if (template && template.slug) {
    redirect(`/admin/itineraries/${template.slug}`);
  } else {
    redirect('/admin/itineraries');
  }
}
