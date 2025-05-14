import type { Meta, StoryObj } from '@storybook/react';
import { VirtualizedDataTable } from '@/app/admin/components/VirtualizedDataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Trash } from 'lucide-react';

// Define sample data type
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  lastLogin: string;
  subscriptionTier: 'free' | 'basic' | 'premium';
}

// Generate sample data
const generateUsers = (count: number): User[] => {
  return Array(count)
    .fill(null)
    .map((_, index) => ({
      id: `user-${index + 1}`,
      name: `User ${index + 1}`,
      email: `user${index + 1}@example.com`,
      role: index % 5 === 0 ? 'Admin' : index % 3 === 0 ? 'Editor' : 'Viewer',
      status: index % 7 === 0 ? 'inactive' : index % 9 === 0 ? 'pending' : 'active',
      createdAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lastLogin:
        index % 3 === 0
          ? 'Never'
          : new Date(Date.now() - index * 3 * 60 * 60 * 1000).toISOString().split('T')[0],
      subscriptionTier: index % 10 === 0 ? 'premium' : index % 3 === 0 ? 'basic' : 'free',
    }));
};

const meta = {
  title: 'Admin/VirtualizedDataTable',
  component: VirtualizedDataTable,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="p-6 max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof VirtualizedDataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: generateUsers(100),
    columns: [
      {
        header: 'Name',
        accessor: (row: unknown) => (row as User).name,
        sortable: true,
        filterable: true,
      },
      {
        header: 'Email',
        accessor: (row: unknown) => (row as User).email,
        sortable: true,
        filterable: true,
      },
      {
        header: 'Role',
        accessor: (row: unknown) => (row as User).role,
        sortable: true,
        filterable: true,
      },
      {
        header: 'Status',
        accessor: (row: unknown) => (row as User).status,
        sortable: true,
        filterable: true,
        cell: (value: User['status']) => (
          <Badge
            className={
              value === 'active'
                ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400'
                : value === 'inactive'
                  ? 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-800/30 dark:text-amber-400'
            }
          >
            {value}
          </Badge>
        ),
      },
      { header: 'Created', accessor: (row: unknown) => (row as User).createdAt, sortable: true },
      { header: 'Last Login', accessor: (row: unknown) => (row as User).lastLogin, sortable: true },
      {
        header: 'Subscription',
        accessor: (row: unknown) => (row as User).subscriptionTier,
        sortable: true,
        filterable: true,
        cell: (value: User['subscriptionTier']) => (
          <Badge
            variant="outline"
            className={
              value === 'premium'
                ? 'border-purple-500 text-purple-700 dark:text-purple-400'
                : value === 'basic'
                  ? 'border-blue-500 text-blue-700 dark:text-blue-400'
                  : 'border-gray-500 text-gray-700 dark:text-gray-400'
            }
          >
            {value}
          </Badge>
        ),
      },
    ],
    actions: [
      {
        label: 'View',
        onClick: (row) => console.log('View', row),
      },
      {
        label: 'Edit',
        onClick: (row) => console.log('Edit', row),
      },
      {
        label: 'Delete',
        onClick: (row) => console.log('Delete', row),
        color: 'destructive',
      },
    ],
    bulkActions: [
      {
        label: 'Delete Selected',
        onClick: (rows) => console.log('Delete Selected', rows),
        requiresConfirmation: true,
        confirmationMessage: 'Are you sure you want to delete the selected users?',
      },
      {
        label: 'Change Role',
        onClick: (rows) => console.log('Change Role', rows),
      },
    ],
    idField: 'id' as unknown as undefined,
    defaultSortField: 'name' as unknown as undefined,
    defaultSortDirection: 'asc',
    tableHeight: 500,
  },
};

export const WithPagination: Story = {
  args: {
    ...Default.args,
    data: generateUsers(500),
    pagination: {
      pageSize: 25,
      pageIndex: 0,
      pageCount: 20,
      onPageChange: (page) => console.log('Page changed to', page),
    },
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    isLoading: true,
  },
};

export const EmptyState: Story = {
  args: {
    ...Default.args,
    data: [],
  },
};
