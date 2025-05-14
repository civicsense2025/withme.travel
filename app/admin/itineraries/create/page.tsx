import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import TemplateEditor from '../components/TemplateEditor';

export const metadata = {
  title: 'Create Template | Admin Panel',
  description: 'Create a new itinerary template',
};

export default async function CreateTemplatePage() {
  // Use the basic Supabase client instead of server client to avoid cookie issues
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Verify admin access
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    redirect('/login?redirectTo=/admin/itineraries/create');
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    redirect('/login?redirectTo=/admin');
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Create New Template</h1>
      <TemplateEditor isNew={true} />
    </div>
  );
}
