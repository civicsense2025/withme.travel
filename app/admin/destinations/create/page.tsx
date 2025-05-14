import { checkAdminAuth } from '../../utils/auth';
import { redirect } from 'next/navigation';
import { Container } from '@/components/container';
import DestinationForm from '../components/DestinationForm';

export const metadata = {
  title: 'Add Destination | Admin Panel',
  description: 'Add a new destination to withme.travel',
};

export default async function CreateDestinationPage() {
  const { isAdmin } = await checkAdminAuth();

  if (!isAdmin) {
    redirect('/login?redirectTo=/admin/destinations/create');
  }

  return (
    <Container>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add New Destination</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Create a new destination by filling out the form below
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
        <DestinationForm />
      </div>
    </Container>
  );
}
