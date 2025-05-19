import { redirect } from 'next/navigation';
import { Container } from '@/components/features/layout/organisms/container';
import { checkAdminAuth } from '../utils/auth';

export const metadata = {
  title: 'Manage Continents | Admin Panel',
  description: 'Manage continent data on withme.travel',
};

export default async function AdminContinentsPage() {
  const { isAdmin, supabase } = await checkAdminAuth();

  if (!isAdmin) {
    redirect('/login?redirectTo=/admin/continents');
  }

  if (!supabase) {
    redirect('/login?error=supabase_client_error');
  }

  return (
    <Container>
      <h1 className="text-3xl font-bold mb-8">Manage Continents</h1>
      
      <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-4 rounded">
        This feature is under development. Please check back soon.
      </div>
    </Container>
  );
} 