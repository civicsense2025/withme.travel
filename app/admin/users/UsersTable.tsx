'use client';
import { useState } from 'react';
import { DataTable } from '../components/DataTable';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  username: string | null;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  is_admin: boolean;
}

interface UsersTableProps {
  initialData: User[];
}

export default function UsersTable({ initialData }: UsersTableProps) {
  const [users, setUsers] = useState<User[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const columns = [
    {
      header: 'User',
      accessor: (row: User) => row,
      sortable: false,
      cell: (value: User) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            {value.avatar_url ? (
              <img
                className="h-10 w-10 rounded-full"
                src={value.avatar_url}
                alt={`${value.full_name || value.username || 'User'}'s avatar`}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  {(value.full_name || value.username || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium">{value.full_name || 'No Name'}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              @{value.username || 'no-username'}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Email',
      accessor: 'email' as keyof User,
      sortable: true,
    },
    {
      header: 'Created',
      accessor: 'created_at' as keyof User,
      sortable: true,
      cell: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      header: 'Role',
      accessor: 'is_admin' as keyof User,
      sortable: true,
      cell: (value: boolean) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            value
              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
          }`}
        >
          {value ? 'Admin' : 'User'}
        </span>
      ),
    },
  ];

  const actions = [
    {
      label: 'Edit',
      onClick: (rows: User[]) => {
        if (rows.length === 1) {
          router.push(`/admin/users/${rows[0].id}`);
        }
      },
      color: 'text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300',
    },
    {
      label: 'Delete',
      onClick: (rows: User[]) => {
        if (
          rows.length === 1 &&
          confirm(
            `Are you sure you want to delete user ${rows[0].username || rows[0].email || rows[0].id}?`
          )
        ) {
          handleDelete(rows[0].id);
        }
      },
      color: 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300',
    },
  ];

  const bulkActions = [
    {
      label: 'Grant Admin',
      onClick: (rows: User[]) => {
        handleBulkAdminChange(rows, true);
      },
      color: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      label: 'Revoke Admin',
      onClick: (rows: User[]) => {
        handleBulkAdminChange(rows, false);
      },
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      label: 'Delete Selected',
      onClick: (rows: User[]) => {
        handleBulkDelete(rows);
      },
      color: 'bg-red-600 hover:bg-red-700',
      requiresConfirmation: true,
      confirmationMessage:
        'Are you sure you want to delete the selected users? This cannot be undone.',
    },
  ];

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);

      if (error) throw error;

      // Update local state
      setUsers((prev) => prev.filter((user) => user.id !== id));

      // Refresh the page
      router.refresh();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async (rows: User[]) => {
    setIsLoading(true);
    try {
      const ids = rows.map((row) => row.id);

      const { error } = await supabase.from('profiles').delete().in('id', ids);

      if (error) throw error;

      // Update local state
      setUsers((prev) => prev.filter((user) => !ids.includes(user.id)));

      // Refresh the page
      router.refresh();
    } catch (error) {
      console.error('Error bulk deleting users:', error);
      alert('Failed to delete selected users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkAdminChange = async (rows: User[], adminStatus: boolean) => {
    setIsLoading(true);
    try {
      const ids = rows.map((row) => row.id);

      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: adminStatus })
        .in('id', ids);

      if (error) throw error;

      // Update local state
      setUsers((prev) =>
        prev.map((user) => (ids.includes(user.id) ? { ...user, is_admin: adminStatus } : user))
      );

      // Refresh the page
      router.refresh();
    } catch (error) {
      console.error(`Error ${adminStatus ? 'granting' : 'revoking'} admin privileges:`, error);
      alert(`Failed to ${adminStatus ? 'grant' : 'revoke'} admin privileges`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Users</h1>
        <Link
          href="/admin/users/create"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          Add User
        </Link>
      </div>

      <DataTable
        data={users}
        columns={columns}
        actions={actions}
        bulkActions={bulkActions}
        idField="id"
      />
    </div>
  );
}
