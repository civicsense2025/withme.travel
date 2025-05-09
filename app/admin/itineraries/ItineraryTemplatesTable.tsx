'use client';
import { useState, useEffect } from 'react';
import { DataTable } from '../components/DataTable';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarDays, Eye, Edit, Trash2, Star } from 'lucide-react';
import { formatDate } from '@/utils/text-utils';
import { TABLES } from '@/utils/constants/tables';

type ItineraryTemplate = {
  id: string;
  title: string;
  slug?: string;
  destination_id?: string;
  destinations?: {
    city: string | null;
    name: string | null;
    country: string | null;
  } | null;
  duration_days?: number;
  is_featured?: boolean;
  created_at: string;
  updated_at?: string;
  created_by?: string;
};

interface ItineraryTemplatesTableProps {
  initialData: ItineraryTemplate[];
  totalCount: number;
}

export default function ItineraryTemplatesTable({ initialData, totalCount }: ItineraryTemplatesTableProps) {
  const [templates, setTemplates] = useState<ItineraryTemplate[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
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
          .from(TABLES.ITINERARY_TEMPLATES)
          .select(`
            id,
            title,
            slug,
            destination_id,
            destinations:destination_id (
              city,
              name,
              country
            ),
            duration_days,
            is_featured,
            created_at,
            updated_at,
            created_by
          `)
          .order('updated_at', { ascending: false })
          .range(pageIndex * pageSize, (pageIndex + 1) * pageSize - 1);
          
        if (searchTerm) {
          query = query.or(`title.ilike.%${searchTerm}%`).or(`destinations.city.ilike.%${searchTerm}%`).or(`destinations.name.ilike.%${searchTerm}%`);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Defensive mapping: ensure destinations is always an object or null
        setTemplates(
          (data || []).map((t: any) => ({
            ...t,
            destinations: t.destinations && !Array.isArray(t.destinations)
              ? t.destinations
              : (Array.isArray(t.destinations) && t.destinations.length > 0
                ? t.destinations[0]
                : null),
          }))
        );
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPage();
  }, [pageIndex, pageSize, searchTerm, supabase]);

  const columns = [
    {
      header: 'Title',
      accessor: 'title' as keyof ItineraryTemplate,
      sortable: true,
      filterable: true,
      cell: (value: string, row: ItineraryTemplate) => (
        <div className="flex items-center gap-2">
          <div className="font-medium">
            {value || 'Untitled Template'}
          </div>
          {row.is_featured && (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
              Featured
            </Badge>
          )}
        </div>
      ),
    },
    {
      header: 'Destination',
      accessor: 'destinations' as keyof ItineraryTemplate,
      sortable: true,
      filterable: true,
      cell: (value: ItineraryTemplate['destinations']) => {
        const city = value?.city || value?.name;
        const country = value?.country;
        if (city && country) return `${city}, ${country}`;
        if (city) return city;
        if (country) return country;
        return 'No city';
      },
    },
    {
      header: 'Days',
      accessor: 'duration_days' as keyof ItineraryTemplate,
      sortable: true,
      cell: (value: number) => (
        <div className="flex items-center">
          <CalendarDays className="mr-2 h-4 w-4 text-gray-400" />
          {value || 'N/A'}
        </div>
      ),
    },
    {
      header: 'Created',
      accessor: 'created_at' as keyof ItineraryTemplate,
      sortable: true,
      cell: (value: string) => formatDate(value, { year: 'numeric', month: 'short', day: 'numeric' }),
    },
    {
      header: 'Last Updated',
      accessor: 'updated_at' as keyof ItineraryTemplate,
      sortable: true,
      cell: (value: string) => value ? formatDate(value, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Never',
    },
    {
      header: 'Actions',
      accessor: 'id' as keyof ItineraryTemplate,
      cell: (value: string, row: ItineraryTemplate) => (
        <div className="flex items-center gap-2">
          <Link 
            href={`/itineraries/${row.slug || value}`}
            className="text-blue-600 hover:text-blue-800"
            target="_blank"
          >
            <Eye size={18} />
          </Link>
          <Link 
            href={`/admin/itineraries/${row.slug || value}`}
            className="text-amber-600 hover:text-amber-800"
          >
            <Edit size={18} />
          </Link>
          <button 
            onClick={() => handleToggleFeatured(row)}
            className={row.is_featured ? "text-yellow-500 hover:text-yellow-700" : "text-gray-400 hover:text-gray-600"}
          >
            <Star size={18} />
          </button>
          <button 
            onClick={() => handleDelete(row)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const actions = [
    {
      label: 'Edit Template',
      onClick: (rows: ItineraryTemplate[]) => {
        if (rows.length === 1) {
          router.push(`/admin/itineraries/edit/${rows[0].id}`);
        }
      },
      color: 'text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300',
    },
    {
      label: 'Toggle Featured',
      onClick: (rows: ItineraryTemplate[]) => {
        if (rows.length === 1) {
          handleToggleFeatured(rows[0]);
        } else if (rows.length > 1) {
          handleBulkToggleFeatured(rows);
        }
      },
      color: 'text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300',
    },
    {
      label: 'Delete',
      onClick: (rows: ItineraryTemplate[]) => {
        if (rows.length === 1) {
          handleDelete(rows[0]);
        } else if (rows.length > 1) {
          handleBulkDelete(rows);
        }
      },
      color: 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300',
    },
  ];

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPageIndex(0); // Reset to first page
  };

  const handleToggleFeatured = async (template: ItineraryTemplate) => {
    try {
      const { error } = await supabase
        .from('itinerary_templates')
        .update({ is_featured: !template.is_featured })
        .eq('id', template.id);
      
      if (error) throw error;
      
      // Update local state
      setTemplates(prev =>
        prev.map(t => t.id === template.id ? { ...t, is_featured: !t.is_featured } : t)
      );
    } catch (error) {
      console.error('Error toggling featured status:', error);
    }
  };

  const handleBulkToggleFeatured = async (templates: ItineraryTemplate[]) => {
    try {
      // Implement bulk toggle functionality
      // This would ideally use a batch operation if supported
      for (const template of templates) {
        await supabase
          .from('itinerary_templates')
          .update({ is_featured: !template.is_featured })
          .eq('id', template.id);
      }
      
      // Refresh the data after bulk operation
      router.refresh();
    } catch (error) {
      console.error('Error performing bulk toggle:', error);
    }
  };

  const handleDelete = async (template: ItineraryTemplate) => {
    if (!window.confirm(`Are you sure you want to delete "${template.title}"?`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('itinerary_templates')
        .delete()
        .eq('id', template.id);
      
      if (error) throw error;
      
      // Update local state
      setTemplates(prev => prev.filter(t => t.id !== template.id));
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const handleBulkDelete = async (templates: ItineraryTemplate[]) => {
    if (!window.confirm(`Are you sure you want to delete ${templates.length} templates?`)) {
      return;
    }
    
    try {
      // Implement bulk delete functionality
      const ids = templates.map(t => t.id);
      const { error } = await supabase
        .from('itinerary_templates')
        .delete()
        .in('id', ids);
      
      if (error) throw error;
      
      // Refresh the data after bulk operation
      router.refresh();
    } catch (error) {
      console.error('Error performing bulk delete:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-muted-foreground">
          {isLoading 
            ? 'Loading...' 
            : `Showing ${templates.length} of ${totalCount.toLocaleString()} templates.`
          }
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Search templates..."
            className="px-4 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 w-60"
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Link href="/admin/itineraries/create">
            <Button size="sm">Create New</Button>
          </Link>
        </div>
      </div>

      <DataTable
        data={templates}
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