import { redirect } from 'next/navigation';
import { Container } from '@/components/container';

export const metadata = {
  title: 'Manage Destinations | Admin Panel',
  description: 'Manage destinations and cities on withme.travel',
};

export default function AdminDestinationsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Destinations Admin</h1>
      <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-4 rounded">
        This feature is no longer available. The underlying database tables have been removed.
      </div>
    </div>
  );
}
