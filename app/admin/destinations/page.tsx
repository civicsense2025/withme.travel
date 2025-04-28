"use client";

import { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { Database } from '@/types/supabase';
type Destination = Database['public']['Tables']['destinations']['Row'];
import useSWR, { mutate } from 'swr';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { DestinationForm } from './destination-form';
import { toast } from 'sonner';
import { ColumnDef, Row } from '@tanstack/react-table';

export default function AdminDestinationsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<Destination | undefined>();

  const fetchDestinations = async () => {
    const response = await fetch('/api/admin/destinations');
    if (!response.ok) {
      throw new Error('Failed to fetch destinations');
    }
    const data = await response.json();
    return data.destinations;
  };

  const { data: destinations, error, isLoading } = useSWR<Destination[]>('/api/admin/destinations', fetchDestinations);

  const handleCreateDestination = async (data: Partial<Destination>) => {
    try {
      const response = await fetch('/api/admin/destinations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create destination');
      }

      await mutate('/api/admin/destinations');
      toast.success('Destination created successfully');
    } catch (error) {
      console.error('Error creating destination:', error);
      toast.error('Failed to create destination');
      throw error;
    }
  };

  const handleEditDestination = async (data: Partial<Destination>) => {
    if (!selectedDestination?.id) return;

    try {
      const response = await fetch(`/api/admin/destinations/${selectedDestination.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update destination');
      }

      await mutate('/api/admin/destinations');
      toast.success('Destination updated successfully');
    } catch (error) {
      console.error('Error updating destination:', error);
      toast.error('Failed to update destination');
      throw error;
    }
  };

  const handleDeleteDestination = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/destinations/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete destination');
      }

      await mutate('/api/admin/destinations');
      toast.success('Destination deleted successfully');
    } catch (error) {
      console.error('Error deleting destination:', error);
      toast.error('Failed to delete destination');
    }
  };

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-destructive">Error loading destinations</h2>
          <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
        </div>
      </Card>
    );
  }

  const tableColumns: ColumnDef<Destination>[] = [
    ...columns,
    {
      id: 'actions',
      cell: ({ row }: { row: Row<Destination> }) => {
        const destination = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedDestination(destination);
                setFormOpen(true);
              }}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => handleDeleteDestination(destination.id)}
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-5xl leading-loose font-bold">Destinations</h1>
        <Button onClick={() => {
          setSelectedDestination(undefined);
          setFormOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Destination
        </Button>
      </div>
      
      {isLoading ? (
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </Card>
      ) : destinations ? (
        <DataTable columns={tableColumns} data={destinations} />
      ) : null}

      <DestinationForm
        open={formOpen}
        onOpenChange={setFormOpen}
        destination={selectedDestination}
        onSubmit={selectedDestination ? handleEditDestination : handleCreateDestination}
      />
    </div>
  );
} 