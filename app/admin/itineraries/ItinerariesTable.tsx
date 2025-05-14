'use client';
import { useState } from 'react';
import { DataTable } from '../components/DataTable';
import { createBrowserClient } from '@supabase/ssr';
import { TABLES } from '@/utils/constants/tables';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Profile {
  username: string | null;
  name: string | null;
}

export interface Itinerary {
  id: string;
  title: string;
  slug: string;
  destination: string;
  created_at: string;
  created_by: string;
  is_published: boolean;
  days: number;
  profiles: Profile | null;
}

interface ItinerariesTableProps {
  initialData: Itinerary[];
}

export default function ItinerariesTable({ initialData }: ItinerariesTableProps) {
  const [itineraries, setItineraries] = useState<Itinerary[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const columns = [
    {
      header: 'Title',
      accessor: 'title' as keyof Itinerary,
      sortable: true,
      filterable: true,
      cell: (value: string, row: Itinerary) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">/itineraries/{row.slug}</div>
        </div>
      ),
    },
    {
      header: 'Destination',
      accessor: 'destination' as keyof Itinerary,
      sortable: true,
      filterable: true,
    },
    {
      header: 'Author ID',
      accessor: 'created_by' as keyof Itinerary,
      sortable: true,
      filterable: true,
    },
    {
      header: 'Days',
      accessor: 'days' as keyof Itinerary,
      sortable: true,
      cell: (value: number) => value || 1,
    },
    {
      header: 'Status',
      accessor: 'is_published' as keyof Itinerary,
      sortable: true,
      cell: (value: boolean) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            value
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
          }`}
        >
          {value ? 'Published' : 'Draft'}
        </span>
      ),
    },
    {
      header: 'Created',
      accessor: 'created_at' as keyof Itinerary,
      sortable: true,
      cell: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  const actions = [
    {
      label: 'Edit',
      onClick: (rows: Itinerary[]) => {
        if (rows.length === 1) {
          if (rows[0].slug) {
            router.push(`/admin/itineraries/${rows[0].slug}`);
          } else {
            router.push(`/admin/itineraries/edit/${rows[0].id}`);
          }
        }
      },
      color: 'text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300',
    },
    {
      label: 'Delete',
      onClick: (rows: Itinerary[]) => {
        if (rows.length === 1 && confirm(`Are you sure you want to delete ${rows[0].title}?`)) {
          handleDelete(rows[0].id);
        }
      },
      color: 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300',
    },
  ];

  const bulkActions = [
    {
      label: 'Publish Selected',
      onClick: (rows: Itinerary[]) => {
        handleBulkPublish(rows, true);
      },
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      label: 'Unpublish Selected',
      onClick: (rows: Itinerary[]) => {
        handleBulkPublish(rows, false);
      },
      color: 'bg-yellow-600 hover:bg-yellow-700',
    },
    {
      label: 'Delete Selected',
      onClick: (rows: Itinerary[]) => {
        handleBulkDelete(rows);
      },
      color: 'bg-red-600 hover:bg-red-700',
      requiresConfirmation: true,
      confirmationMessage:
        'Are you sure you want to delete the selected itineraries? This cannot be undone.',
    },
  ];

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from('itinerary_templates').delete().eq('id', id);

      if (error) throw error;

      // Update local state
      setItineraries((prev) => prev.filter((item) => item.id !== id));

      // Refresh the page
      router.refresh();
    } catch (error) {
      console.error('Error deleting itinerary:', error);
      alert('Failed to delete itinerary');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async (rows: Itinerary[]) => {
    setIsLoading(true);
    try {
      const ids = rows.map((row) => row.id);

      const { error } = await supabase.from(TABLES.ITINERARY_TEMPLATES).delete().in('id', ids);

      if (error) throw error;

      // Update local state
      setItineraries((prev) => prev.filter((item) => !ids.includes(item.id)));

      // Refresh the page
      router.refresh();
    } catch (error) {
      console.error('Error bulk deleting itineraries:', error);
      alert('Failed to delete selected itineraries');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkPublish = async (rows: Itinerary[], publishState: boolean) => {
    setIsLoading(true);
    try {
      const ids = rows.map((row) => row.id);

      const { error } = await supabase
        .from(TABLES.ITINERARY_TEMPLATES)
        .update({ is_published: publishState })
        .in('id', ids);

      if (error) throw error;

      // Update local state
      setItineraries((prev) =>
        prev.map((item) => (ids.includes(item.id) ? { ...item, is_published: publishState } : item))
      );

      // Refresh the page
      router.refresh();
    } catch (error) {
      console.error(`Error ${publishState ? 'publishing' : 'unpublishing'} itineraries:`, error);
      alert(`Failed to ${publishState ? 'publish' : 'unpublish'} selected itineraries`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Itineraries</h1>
        <Link
          href="/admin/itineraries/create"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          Add Itinerary Template
        </Link>
      </div>

      <DataTable
        data={itineraries}
        columns={columns}
        actions={actions}
        bulkActions={bulkActions}
        idField="id"
      />
    </div>
  );
}
