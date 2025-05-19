'use client';
import { useState } from 'react';
import { DataTable } from '../components/DataTable';
import { createBrowserClient } from '@supabase/ssr';
import { TABLES } from '@/utils/constants/tables';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FeedbackItem } from './page';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface FeedbackTableProps {
  initialData: FeedbackItem[];
}

export default function FeedbackTable({ initialData }: FeedbackTableProps) {
  const [feedback, setFeedback] = useState<FeedbackItem[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const feedbackTypeColors: Record<string, string> = {
    bug_report: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    feature_request: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    general: 'bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300',
    improvement: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    question: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    other: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  };

  const feedbackStatusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    archived: 'bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300',
  };

  // Define columns - will use type assertion later to satisfy DataTable's type requirements
  const columns = [
    {
      id: 'select',
      header: 'Select',
      cell: ({ row }: { row: any }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
    },
    {
      header: 'Content',
      accessor: 'content' as keyof FeedbackItem,
      sortable: true,
      cell: (value: string, row: FeedbackItem) => (
        <div className="max-w-md">
          <div className="font-medium line-clamp-2">{value}</div>
        </div>
      ),
    },
    {
      header: 'User',
      accessor: (row: FeedbackItem) => row.user?.full_name || row.email || 'Anonymous',
      sortable: true,
      cell: (value: string, row: FeedbackItem) => (
        <div>
          <div className="font-medium">{value}</div>
          {row.user_id && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {row.user?.email || row.email}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Type',
      accessor: 'type' as keyof FeedbackItem,
      sortable: true,
      cell: (value: string) => (
        <Badge
          className={`${feedbackTypeColors[value as keyof typeof feedbackTypeColors] || feedbackTypeColors.other}`}
        >
          {value.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      header: 'Status',
      accessor: 'status' as keyof FeedbackItem,
      sortable: true,
      cell: (value: string) => (
        <Badge
          className={`${feedbackStatusColors[value as keyof typeof feedbackStatusColors] || feedbackStatusColors.new}`}
        >
          {value.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      header: 'Date',
      accessor: 'created_at' as keyof FeedbackItem,
      sortable: true,
      cell: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: { original: FeedbackItem } }) => {
        const id = row.original.id;

        return (
          <div className="flex items-center gap-2">
            <Link href={`/admin/feedback/${id}`} legacyBehavior>
              <Button variant="ghost" size="sm">
                View
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => handleDelete(id)}
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  const actions = [
    {
      label: 'View',
      onClick: (rows: FeedbackItem[]) => {
        if (rows.length === 1) {
          router.push(`/admin/feedback/${rows[0].id}`);
        }
      },
      color: 'text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300',
    },
    {
      label: 'Delete',
      onClick: (rows: FeedbackItem[]) => {
        if (rows.length === 1 && confirm(`Are you sure you want to delete this feedback?`)) {
          handleDelete(rows[0].id);
        }
      },
      color: 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300',
    },
  ];

  const bulkActions = [
    {
      label: 'Mark as Completed',
      onClick: (rows: FeedbackItem[]) => {
        handleBulkStatusChange(rows, 'completed');
      },
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      label: 'Mark as In Progress',
      onClick: (rows: FeedbackItem[]) => {
        handleBulkStatusChange(rows, 'in_progress');
      },
      color: 'bg-yellow-600 hover:bg-yellow-700',
    },
    {
      label: 'Archive',
      onClick: (rows: FeedbackItem[]) => {
        handleBulkStatusChange(rows, 'archived');
      },
      color: 'bg-gray-600 hover:bg-gray-700',
    },
    {
      label: 'Delete Selected',
      onClick: (rows: FeedbackItem[]) => {
        handleBulkDelete(rows);
      },
      color: 'bg-red-600 hover:bg-red-700',
      requiresConfirmation: true,
      confirmationMessage:
        'Are you sure you want to delete the selected feedback items? This cannot be undone.',
    },
  ];

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from(TABLES.FEEDBACK).delete().eq('id', id);

      if (error) throw error;

      // Update local state
      setFeedback((prev) => prev.filter((item) => item.id !== id));

      // Refresh the page
      router.refresh();
    } catch (error) {
      console.error('Error deleting feedback:', error);
      alert('Failed to delete feedback');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async (rows: FeedbackItem[]) => {
    setIsLoading(true);
    try {
      const ids = rows.map((row) => row.id);

      const { error } = await supabase.from(TABLES.FEEDBACK).delete().in('id', ids);

      if (error) throw error;

      // Update local state
      setFeedback((prev) => prev.filter((item) => !ids.includes(item.id)));

      // Refresh the page
      router.refresh();
    } catch (error) {
      console.error('Error bulk deleting feedback:', error);
      alert('Failed to delete selected feedback');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkStatusChange = async (rows: FeedbackItem[], status: string) => {
    setIsLoading(true);
    try {
      const ids = rows.map((row) => row.id);

      const { error } = await supabase.from(TABLES.FEEDBACK).update({ status }).in('id', ids);

      if (error) throw error;

      // Update local state
      setFeedback((prev) =>
        prev.map((item) => (ids.includes(item.id) ? { ...item, status } : item))
      );

      // Refresh the page
      router.refresh();
    } catch (error) {
      console.error(`Error updating feedback status:`, error);
      alert(`Failed to update selected feedback items`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Feedback</h1>
      </div>

      <DataTable
        data={feedback}
        columns={columns as any}
        actions={actions}
        bulkActions={bulkActions}
        idField="id"
      />
    </div>
  );
}
