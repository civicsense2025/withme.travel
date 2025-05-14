import { redirect } from 'next/navigation';
import { Container } from '@/components/container';
import { checkAdminAuth } from '../utils/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TABLES } from '@/utils/constants/tables';

export const metadata = {
  title: 'Content Management | Admin Panel',
  description: 'Manage content on withme.travel',
};

export default async function AdminContentPage() {
  const { isAdmin, supabase, error } = await checkAdminAuth();

  if (!isAdmin) {
    redirect('/login?redirectTo=/admin/content');
  }

  if (!supabase) {
    redirect('/login?error=supabase_client_error');
  }

  // Get data for different content types
  const { count: cityCount } = await supabase
    .from(TABLES.CITIES)
    .select('*', { count: 'exact', head: true });

  const { count: destinationCount } = await supabase
    .from(TABLES.DESTINATIONS)
    .select('*', { count: 'exact', head: true });

  const { count: templateCount } = await supabase
    .from(TABLES.ITINERARY_TEMPLATES)
    .select('*', { count: 'exact', head: true });

  return (
    <Container>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Content Management</h1>
        <p className="text-gray-500 mt-2">Manage all content on the withme.travel platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-2">Cities</h3>
          <div className="text-3xl font-bold">{cityCount || 0}</div>
          <p className="text-gray-500 mt-1">Cities in database</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-2">Destinations</h3>
          <div className="text-3xl font-bold">{destinationCount || 0}</div>
          <p className="text-gray-500 mt-1">Destinations in database</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-2">Itinerary Templates</h3>
          <div className="text-3xl font-bold">{templateCount || 0}</div>
          <p className="text-gray-500 mt-1">Templates in database</p>
        </div>
      </div>

      <Tabs defaultValue="cities" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="cities">Cities</TabsTrigger>
          <TabsTrigger value="destinations">Destinations</TabsTrigger>
          <TabsTrigger value="templates">Itinerary Templates</TabsTrigger>
          <TabsTrigger value="validation">Content Validation</TabsTrigger>
        </TabsList>

        <TabsContent value="cities">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <p className="text-gray-500">
              Cities management interface will be available here. This will include the ability to
              add, edit, and delete cities.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="destinations">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <p className="text-gray-500">
              Destinations management interface will be available here. This will include the
              ability to add, edit, and delete destinations.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <p className="text-gray-500">
              Itinerary templates management interface will be available here. This will include the
              ability to add, edit, and delete templates.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="validation">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <p className="text-gray-500">
              Content validation tools will be available here. This will include checking for
              missing data, broken links, and other quality issues.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </Container>
  );
}
