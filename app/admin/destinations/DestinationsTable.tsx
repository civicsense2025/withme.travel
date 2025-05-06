'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '../components/DataTable';
import { createBrowserClient } from '@supabase/ssr';
import { TABLES } from '@/utils/constants/database';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Destination = {
  id: string;
  name: string;
  city: string;
  country: string;
  continent: string;
  popularity: number;
  likes_count: number;
};

export default function DestinationsTable({ initialData }: { initialData: Destination[] }) {
  const [destinations, setDestinations] = useState<Destination[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const columns = [
    {
      header: 'Name',
      accessor: 'name' as keyof Destination,
      sortable: true,
      filterable: true,
      cell: (value: string, row: Destination) => (
        <div>
          <div className="font-medium">
            {value || row.city || 'Unnamed Location'}
          </div>
        </div>
      ),
    },
    {
      header: 'Location',
      accessor: (row: Destination) => `${row.city ? `${row.city}, ` : ''}${row.country}`,
      sortable: true,
    },
    {
      header: 'City',
      accessor: 'city' as keyof Destination,
      sortable: true,
      filterable: true,
    },
    {
      header: 'Country',
      accessor: 'country' as keyof Destination,
      sortable: true,
      filterable: true,
    },
    {
      header: 'Continent',
      accessor: 'continent' as keyof Destination,
      sortable: true,
      filterable: true,
    },
    {
      header: 'Popularity',
      accessor: 'popularity' as keyof Destination,
      sortable: true,
      cell: (value: number) => value || 'N/A',
    },
    {
      header: 'Likes',
      accessor: 'likes_count' as keyof Destination,
      sortable: true,
      cell: (value: number) => value || 0,
    },
  ];

  const actions = [
    {
      label: 'Edit',
      onClick: (rows: Destination[]) => {
        if (rows.length === 1) {
          router.push(`/admin/destinations/${rows[0].id}`);
        }
      },
      color: 'text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300',
    },
    {
      label: 'Delete',
      onClick: (rows: Destination[]) => {
        if (rows.length === 1 && confirm(`Are you sure you want to delete ${rows[0].name || rows[0].city}?`)) {
          handleDelete(rows[0].id);
        }
      },
      color: 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300',
    },
  ];

  const bulkActions = [
    {
      label: 'Export Selected',
      onClick: (rows: Destination[]) => {
        handleExport(rows);
      },
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      label: 'Delete Selected',
      onClick: (rows: Destination[]) => {
        handleBulkDelete(rows);
      },
      color: 'bg-red-600 hover:bg-red-700',
      requiresConfirmation: true,
      confirmationMessage: 'Are you sure you want to delete the selected destinations? This cannot be undone.',
    },
  ];

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from(TABLES.DESTINATIONS)
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setDestinations((prev) => prev.filter((dest) => dest.id !== id));
      
      // Refresh the page
      router.refresh();
    } catch (error) {
      console.error('Error deleting destination:', error);
      alert('Failed to delete destination');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async (rows: Destination[]) => {
    setIsLoading(true);
    try {
      const ids = rows.map((row) => row.id);
      
      const { error } = await supabase
        .from(TABLES.DESTINATIONS)
        .delete()
        .in('id', ids);

      if (error) throw error;

      // Update local state
      setDestinations((prev) => prev.filter((dest) => !ids.includes(dest.id)));
      
      // Refresh the page
      router.refresh();
    } catch (error) {
      console.error('Error bulk deleting destinations:', error);
      alert('Failed to delete selected destinations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = (rows: Destination[]) => {
    try {
      // Convert the selected rows to CSV
      const headers = columns.map((col) => typeof col.accessor === 'string' ? col.accessor : col.header);
      
      const csvContent = [
        headers.join(','),
        ...rows.map((row) => 
          columns.map((col) => {
            const value = typeof col.accessor === 'function' 
              ? col.accessor(row) 
              : row[col.accessor as keyof Destination];
            return `"${value}"`;
          }).join(',')
        ),
      ].join('\n');

      // Create a blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'destinations_export.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting destinations:', error);
      alert('Failed to export destinations');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Destinations</h1>
        <Link 
          href="/admin/destinations/create" 
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          Add Destination
        </Link>
      </div>

      <DataTable
        data={destinations}
        columns={columns}
        actions={actions}
        bulkActions={bulkActions}
        idField="id"
      />
    </div>
  );
} 