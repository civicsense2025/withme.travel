import type { Meta, StoryObj } from '@storybook/react';
import { BulkImportExport } from '@/app/admin/components/BulkImportExport';

const meta = {
  title: 'Admin/BulkImportExport',
  component: BulkImportExport,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-4xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BulkImportExport>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const PlacesImport: Story = {
  args: {
    contentTypeId: 'place',
  },
};

export const DestinationsImport: Story = {
  args: {
    contentTypeId: 'destination',
  },
};

export const ActivitiesImport: Story = {
  args: {
    contentTypeId: 'activity',
    parentId: 'dest-123',
  },
};

export const WithParentId: Story = {
  args: {
    contentTypeId: 'place',
    parentId: 'barcelona-123',
  },
};
