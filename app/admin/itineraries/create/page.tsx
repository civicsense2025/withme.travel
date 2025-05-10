import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import TemplateEditor from '../components/TemplateEditor';

export const metadata = {
  title: 'Create Template | Admin Panel',
  description: 'Create a new itinerary template',
};

export default async function CreateTemplatePage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
  
  // Verify admin access
  const { data: { user } } = await supabase.auth.getUser();
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