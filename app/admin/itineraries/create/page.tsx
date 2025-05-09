import { redirect } from 'next/navigation';
import { Container } from '@/components/container';
import { checkAdminAuth } from '../../utils/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import CreateTemplateForm from '../components/CreateTemplateForm';

export const metadata = {
  title: 'Create Template | Admin Panel',
  description: 'Create a new itinerary template',
};

export default async function CreateTemplatePage() {
  const { isAdmin, supabase, error } = await checkAdminAuth();

  if (!isAdmin) {
    redirect('/login?redirectTo=/admin/itineraries/create');
  }

  if (!supabase) {
    redirect('/login?error=supabase_client_error');
  }

  // Fetch all destinations for the dropdown
  const { data: destinations, error: destinationsError } = await supabase
    .from('destinations')
    .select('id, name')
    .order('name');

  if (destinationsError) {
    console.error('Error fetching destinations:', destinationsError);
  }

  return (
    <Container>
      <div className="py-6">
        <h1 className="text-3xl font-bold mb-6">Create New Template</h1>
        <CreateTemplateForm destinations={destinations || []} />
      </div>
    </Container>
  );
} 