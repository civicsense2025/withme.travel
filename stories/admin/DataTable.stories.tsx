import type { Meta, StoryObj } from '@storybook/react';
import { DataTable } from '@/app/admin/components/DataTable';
import { Edit, Trash, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Define sample data types
interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
}

const sampleData: UserData[] = Array(20)
  .fill(null)
  .map((_, index) => ({
    id: `user-${index + 1}`,
    name: `User ${index + 1}`,
    email: `user${index + 1}@example.com`,
    role: index % 3 === 0 ? 'Admin' : index % 3 === 1 ? 'Editor' : 'Viewer',
    status: index % 4 === 0 ? 'inactive' : index % 5 === 0 ? 'pending' : 'active',
    createdAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  }));

const meta = {
  title: 'Admin/DataTable',
  component: DataTable,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'light',
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof DataTable<UserData>>;

// Define columns outside the stories to ensure type safety
const userColumns = [
  {
    header: 'Name',
    accessor: 'name' as keyof UserData,
    sortable: true,
    filterable: true,
  },
  {
    header: 'Email',
    accessor: 'email' as keyof UserData,
    sortable: true,
    filterable: true,
  },
  {
    header: 'Role',
    accessor: 'role' as keyof UserData,
    sortable: true,
    filterable: true,
  },
  {
    header: 'Status',
    accessor: 'status' as keyof UserData,
    sortable: true,
    filterable: true,
    cell: (value: any) => {
      const getStatusColor = (status: string) => {
        switch (status) {
          case 'active':
            return (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            );
          case 'inactive':
            return (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Inactive
              </span>
            );
          case 'pending':
            return (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Pending
              </span>
            );
          default:
            return value;
        }
      };

      return getStatusColor(value);
    },
  },
  {
    header: 'Created',
    accessor: 'createdAt' as keyof UserData,
    sortable: true,
  },
  {
    header: 'Actions',
    accessor: 'id' as keyof UserData,
    cell: (value: any) => (
      <div className="flex space-x-2">
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

export const Default: Story = {
  args: {
    data: sampleData,
    columns: userColumns,
    pagination: {
      pageSize: 5,
      pageIndex: 0,
      pageCount: Math.ceil(sampleData.length / 5),
      onPageChange: () => {},
    },
    idField: 'id',
  },
};

export const WithBulkActions: Story = {
  args: {
    ...Default.args,
    bulkActions: [
      {
        label: 'Delete Selected',
        icon: <Trash className="h-4 w-4 mr-2" />,
        onClick: () => {},
        requiresConfirmation: true,
        confirmationMessage: 'Are you sure you want to delete these items?',
      },
      {
        label: 'Activate',
        onClick: () => {},
      },
      {
        label: 'Deactivate',
        onClick: () => {},
      },
    ],
  },
};

export const WithRowActions: Story = {
  args: {
    ...Default.args,
    actions: [
      {
        label: 'View Details',
        icon: <Eye className="h-4 w-4 mr-2" />,
        onClick: () => {},
      },
      {
        label: 'Edit',
        icon: <Edit className="h-4 w-4 mr-2" />,
        onClick: () => {},
      },
      {
        label: 'Delete',
        icon: <Trash className="h-4 w-4 mr-2" />,
        onClick: () => {},
        color: 'red',
      },
    ],
  },
};

export const EmptyState: Story = {
  args: {
    ...Default.args,
    data: [],
    noDataMessage: 'No users found. Try adjusting your filters or adding new users.',
  },
};

export const Compact: Story = {
  render: (args) => (
    <div className="p-4">
      <DataTable {...args} />
    </div>
  ),
  args: {
    ...Default.args,
    pagination: {
      pageSize: 10,
      pageIndex: 0,
      pageCount: Math.ceil(sampleData.length / 10),
      onPageChange: () => {},
    },
  },
};
