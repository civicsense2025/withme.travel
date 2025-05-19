'use client';
import { useState, useEffect } from 'react';
import { DataTable } from '../components/DataTable';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TABLES } from '@/utils/constants/tables';
import { Badge } from '@/components/ui/badge';

type City = {
  id: string;
  name: string;
  country: string;
  admin_name: string;
  continent: string;
  latitude: number;
  longitude: number;
  population: number;
  destinations?: Array<{ id: string; name: string }>;
};

interface DestinationsTableProps {
  initialData: City[];
  totalCount: number;
}

export default function DestinationsTable({ initialData, totalCount }: DestinationsTableProps) {
  const [cities, setCities] = useState<City[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // When page changes, fetch new data
  useEffect(() => {
    const fetchPage = async () => {
      if (pageIndex === 0 && !searchTerm) return; // Initial page already loaded

      setIsLoading(true);
      try {
        let query = supabase
          .from(TABLES.CITIES)
          .select(
            `
            id,
            name,
            country,
            admin_name,
            continent, 
            latitude,
            longitude,
            population,
            destinations:destinations(id, name)
          `
          )
          .order('name')
          .range(pageIndex * pageSize, (pageIndex + 1) * pageSize - 1);

        if (searchTerm) {
          query = query.or(`name.ilike.%${searchTerm}%,country.ilike.%${searchTerm}%`);
        }

        const { data, error } = await query;

        if (error) throw error;

        setCities(data || []);
      } catch (error) {
        console.error('Error fetching cities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPage();
  }, [pageIndex, pageSize, searchTerm, supabase]);

  const columns = [
    {
      header: 'Name',
      accessor: 'name' as keyof City,
      sortable: true,
      filterable: true,
      cell: (value: string, row: City) => (
        <div className="flex items-center gap-2">
          <div className="font-medium">{value || 'Unnamed Location'}</div>
          {row.destinations && row.destinations.length > 0 && (
            <Badge
              variant="outline"
              className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
            >
              {row.destinations.length} destination{row.destinations.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      ),
    },
    {
      header: 'Location',
      accessor: (row: City) => `${row.admin_name ? `${row.admin_name}, ` : ''}${row.country}`,
      sortable: true,
    },
    {
      header: 'Country',
      accessor: 'country' as keyof City,
      sortable: true,
      filterable: true,
    },
    {
      header: 'Region',
      accessor: 'admin_name' as keyof City,
      sortable: true,
      filterable: true,
    },
    {
      header: 'Continent',
      accessor: 'continent' as keyof City,
      sortable: true,
      filterable: true,
    },
    {
      header: 'Population',
      accessor: 'population' as keyof City,
      sortable: true,
      cell: (value: number) => (value ? value.toLocaleString() : 'N/A'),
    },
  ];

  const actions = [
    {
      label: 'View Destinations',
      onClick: (rows: City[]) => {
        if (rows.length === 1) {
          router.push(`/admin/destinations/city/${rows[0].id}`);
        }
      },
      color: 'text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300',
    },
    {
      label: 'Create Destination',
      onClick: (rows: City[]) => {
        if (rows.length === 1) {
          router.push(`/admin/destinations/create?cityId=${rows[0].id}`);
        }
      },
      color: 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300',
    },
  ];

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPageIndex(0); // Reset to first page
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Cities & Destinations</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/destinations/create"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
          >
            Add Destination
          </Link>
          <input
            type="text"
            placeholder="Search cities..."
            className="px-4 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="text-sm text-muted-foreground mb-2">
        <p>
          {isLoading
            ? 'Loading...'
            : `Showing ${cities.length} of ${totalCount.toLocaleString()} cities. Cities with destinations are highlighted.`}
        </p>
      </div>

      <DataTable
        data={cities}
        columns={columns}
        actions={actions}
        idField="id"
        pagination={{
          pageSize,
          pageIndex,
          pageCount: Math.ceil(totalCount / pageSize),
          onPageChange: setPageIndex,
        }}
      />
    </div>
  );
}
