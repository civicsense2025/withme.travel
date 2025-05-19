'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import AdminAccessCheck from '@/components/features/admin/AdminAccessCheck';
import { EnhancedContentEditor } from '../components/EnhancedContentEditor';
import { VirtualizedDataTable } from '../components/VirtualizedDataTable';
import { BulkImportExport } from '../components/BulkImportExport';
import { FilePlus, Upload, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { TABLES } from '@/utils/constants/database';

// Define interface for destinations data
interface Destination {
  id: string;
  name: string;
  slug: string;
  country: string;
  continent: string;
  active: boolean;
  created_at: string;
}

// Define interface for places data
interface Place {
  id: string;
  name: string;
  description: string;
  category: string;
  destination_id: string;
  address?: string;
  created_at: string;
}

interface Activity {
  id: string;
  name: string;
  description: string;
  destination_id: string;
  duration_minutes?: number;
  price?: number;
  created_at: string;
}

const CONTENT_TYPES = [
  { id: 'destinations', name: 'Destinations', table: 'destinations' },
  { id: 'places', name: 'Places', table: 'places' },
  { id: 'activities', name: 'Activities', table: 'activities' },
];

export default function ContentManagerPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('destinations');
  const [editContentId, setEditContentId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  const fetchData = async () => {
    setIsLoading(true);

    try {
      let endpoint;
      switch (activeTab) {
        case 'destinations':
          endpoint = '/api/admin/destinations';
          const destResponse = await fetch(endpoint);
          if (!destResponse.ok) {
            throw new Error(`Error fetching destinations: ${destResponse.statusText}`);
          }
          const destData = await destResponse.json();
          setDestinations(destData.destinations || []);
          break;

        case 'places':
          endpoint = '/api/admin/places';
          const placesResponse = await fetch(endpoint);
          if (!placesResponse.ok) {
            throw new Error(`Error fetching places: ${placesResponse.statusText}`);
          }
          const placesData = await placesResponse.json();
          setPlaces(placesData.places || []);
          break;

        case 'activities':
          endpoint = '/api/admin/activities';
          const activitiesResponse = await fetch(endpoint);
          if (!activitiesResponse.ok) {
            throw new Error(`Error fetching activities: ${activitiesResponse.statusText}`);
          }
          const activitiesData = await activitiesResponse.json();
          setActivities(activitiesData.activities || []);
          break;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: `Failed to load data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when tab changes or refresh is triggered
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateContent = () => {
    setEditContentId('new');
    setEditDialogOpen(true);
  };

  const handleEditContent = (id: string) => {
    setEditContentId(id);
    setEditDialogOpen(true);
  };

  const handleSaveContent = async (content: string) => {
    try {
      let endpoint = '';
      let method = 'PUT';
      let body = {};

      if (editContentId === 'new') {
        method = 'POST';
        endpoint = `/api/admin/${activeTab}`;
        body = { content };
      } else {
        endpoint = `/api/admin/${activeTab}/${editContentId}`;
        body = { content };
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Error saving content: ${response.statusText}`);
      }

      toast({
        title: 'Success',
        description: `Content successfully ${editContentId === 'new' ? 'created' : 'updated'}`,
      });

      setEditDialogOpen(false);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: 'Error',
        description: `Failed to save content: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteItems = async (items: any[]) => {
    if (window.confirm(`Are you sure you want to delete ${items.length} item(s)?`)) {
      setIsLoading(true);

      try {
        // Process deletions sequentially
        for (const item of items) {
          const endpoint = `/api/admin/${activeTab}/${item.id}`;
          const response = await fetch(endpoint, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error(`Error deleting item ${item.id}: ${response.statusText}`);
          }
        }

        toast({
          title: 'Success',
          description: `Successfully deleted ${items.length} item(s)`,
        });

        fetchData(); // Refresh data
      } catch (error) {
        console.error('Error deleting items:', error);
        toast({
          title: 'Error',
          description: `Failed to delete items: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    }
  };

  const handleActivateItems = async (items: any[]) => {
    setIsLoading(true);

    try {
      // Process updates sequentially
      for (const item of items) {
        const endpoint = `/api/admin/${activeTab}/${item.id}`;
        const response = await fetch(endpoint, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ active: true }),
        });

        if (!response.ok) {
          throw new Error(`Error activating item ${item.id}: ${response.statusText}`);
        }
      }

      toast({
        title: 'Success',
        description: `Successfully activated ${items.length} item(s)`,
      });

      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error activating items:', error);
      toast({
        title: 'Error',
        description: `Failed to activate items: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const handleDeactivateItems = async (items: any[]) => {
    setIsLoading(true);

    try {
      // Process updates sequentially
      for (const item of items) {
        const endpoint = `/api/admin/${activeTab}/${item.id}`;
        const response = await fetch(endpoint, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ active: false }),
        });

        if (!response.ok) {
          throw new Error(`Error deactivating item ${item.id}: ${response.statusText}`);
        }
      }

      toast({
        title: 'Success',
        description: `Successfully deactivated ${items.length} item(s)`,
      });

      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deactivating items:', error);
      toast({
        title: 'Error',
        description: `Failed to deactivate items: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const handleImportSuccess = (result: any) => {
    console.log('Import success:', result);
    setImportDialogOpen(false);
    fetchData();
  };

  // Column definitions for each content type
  const destinationColumns = [
    {
      header: 'Name',
      accessor: 'name' as keyof Destination,
      sortable: true,
      filterable: true,
    },
    {
      header: 'Slug',
      accessor: 'slug' as keyof Destination,
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
      header: 'Status',
      accessor: 'active' as keyof Destination,
      sortable: true,
      filterable: true,
      cell: (value: boolean) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}
        >
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Created',
      accessor: 'created_at' as keyof Destination,
      sortable: true,
      cell: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  const placeColumns = [
    {
      header: 'Name',
      accessor: 'name' as keyof Place,
      sortable: true,
      filterable: true,
    },
    {
      header: 'Category',
      accessor: 'category' as keyof Place,
      sortable: true,
      filterable: true,
    },
    {
      header: 'Destination',
      accessor: 'destination_id' as keyof Place,
      sortable: true,
      filterable: true,
    },
    {
      header: 'Address',
      accessor: 'address' as keyof Place,
      sortable: true,
      filterable: true,
    },
    {
      header: 'Created',
      accessor: 'created_at' as keyof Place,
      sortable: true,
      cell: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  const activityColumns = [
    {
      header: 'Name',
      accessor: 'name' as keyof Activity,
      sortable: true,
      filterable: true,
    },
    {
      header: 'Destination',
      accessor: 'destination_id' as keyof Activity,
      sortable: true,
      filterable: true,
    },
    {
      header: 'Duration',
      accessor: 'duration_minutes' as keyof Activity,
      sortable: true,
      cell: (value: number) => (value ? `${value} mins` : 'N/A'),
    },
    {
      header: 'Price',
      accessor: 'price' as keyof Activity,
      sortable: true,
      cell: (value: number) => (value ? `$${value.toFixed(2)}` : 'Free'),
    },
    {
      header: 'Created',
      accessor: 'created_at' as keyof Activity,
      sortable: true,
      cell: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  // Example actions for the data table
  const rowActions = [
    {
      label: 'Edit',
      onClick: (rows: any[]) => handleEditContent(rows[0].id),
    },
    {
      label: 'Delete',
      onClick: (rows: any[]) => handleDeleteItems(rows),
      color: 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300',
    },
  ];

  // Example bulk actions for the data table
  const bulkActions = [
    {
      label: 'Delete',
      onClick: handleDeleteItems,
      requiresConfirmation: true,
    },
    {
      label: 'Activate',
      onClick: handleActivateItems,
    },
    {
      label: 'Deactivate',
      onClick: handleDeactivateItems,
    },
  ];

  // Sample initial content for editor
  const getInitialContent = (id: string) => {
    if (id === 'new') return '<h2>New Content</h2><p>Start editing here...</p>';
    return `<h2>Content for ${id}</h2><p>This is a sample content for ${id}. Edit as needed.</p><p>Add more paragraphs, images, and links using the toolbar above.</p>`;
  };

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'destinations':
        return destinations;
      case 'places':
        return places;
      case 'activities':
        return activities;
      default:
        return [];
    }
  };

  // Get current columns based on active tab
  const getCurrentColumns = () => {
    switch (activeTab) {
      case 'destinations':
        return destinationColumns;
      case 'places':
        return placeColumns;
      case 'activities':
        return activityColumns;
      default:
        return [];
    }
  };

  return (
    <AdminAccessCheck>
      <div className="p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Content Manager</h1>
            <p className="text-muted-foreground">
              Manage all your content in one place with enhanced tools
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={handleCreateContent} className="flex items-center space-x-2">
              <FilePlus className="h-4 w-4" />
              <span>Create New</span>
            </Button>

            <Button
              variant="outline"
              onClick={fetchData}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>

            <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
              <DialogTrigger>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Upload className="h-4 w-4" />
                  <span>Import/Export</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <BulkImportExport
                  contentTypeId={activeTab}
                  onSuccess={handleImportSuccess}
                  onCancel={() => setImportDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            {CONTENT_TYPES.map((type) => (
              <TabsTrigger key={type.id} value={type.id}>
                {type.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {CONTENT_TYPES.map((type) => (
            <TabsContent key={type.id} value={type.id} className="space-y-6">
              <Card>
                <CardHeader className="bg-muted/40 pb-4">
                  <CardTitle>{type.name}</CardTitle>
                  <CardDescription>
                    Browse, filter, and manage all {type.name.toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <VirtualizedDataTable
                    data={getCurrentData()}
                    columns={getCurrentColumns()}
                    actions={rowActions}
                    bulkActions={bulkActions}
                    isLoading={isLoading}
                    tableHeight={500}
                    defaultSortField="name"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Content Editor Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <div className="flex-1 overflow-hidden flex flex-col">
            <h2 className="text-lg font-semibold pb-4">
              {editContentId === 'new' ? 'Create New Content' : `Edit Content: ${editContentId}`}
            </h2>
            <div className="flex-1 overflow-auto">
              {editContentId && (
                <EnhancedContentEditor
                  initialContent={getInitialContent(editContentId)}
                  contentType={activeTab}
                  contentId={editContentId}
                  onSave={handleSaveContent}
                  onCancel={() => setEditDialogOpen(false)}
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminAccessCheck>
  );
}
