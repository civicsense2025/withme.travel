import type { Meta, StoryObj } from '@storybook/react';
import { AdminDebugPanel } from '@/app/admin/components/AdminDebugPanel';

const meta = {
  title: 'Admin/AdminDebugPanel',
  component: AdminDebugPanel,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AdminDebugPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Debug Information',
    description: 'Technical details for troubleshooting',
    showHeader: true,
    initialTab: 'tables',
  },
};

export const NoHeader: Story = {
  args: {
    showHeader: false,
    initialTab: 'tables',
  },
};

export const RoutesTab: Story = {
  args: {
    title: 'Routes Debug',
    description: 'View all application routes',
    showHeader: true,
    initialTab: 'routes',
  },
};

export const EnvTab: Story = {
  args: {
    title: 'Environment Info',
    description: 'View environment variables and settings',
    showHeader: true,
    initialTab: 'env',
  },
};

export const EnumsTab: Story = {
  args: {
    title: 'Database Enums',
    description: 'View all database enum values',
    showHeader: true,
    initialTab: 'enums',
  },
};
