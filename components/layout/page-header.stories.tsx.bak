import type { Meta, StoryObj } from '@storybook/react';
import { PageHeader } from './page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

const COMPONENT_CATEGORIES = {
  LAYOUT: 'Layout',
  UI: 'UI',
  // Add other categories as needed
};

const meta: Meta<typeof PageHeader> = {
  title: 'Layout/PageHeader',
  component: PageHeader,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text', description: 'Header title' },
    description: { control: 'text', description: 'Header description' },
    centered: { control: 'boolean', description: 'Center the header' },
    actions: { control: false, description: 'Action buttons (ReactNode)' },
  },
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
  args: {
    title: 'Page Title',
    description: 'This is a description for the page header.',
    centered: true,
  },
};

export const WithAction: Story = {
  args: {
    title: 'My Content',
    description: 'A page header with an action button.',
    centered: true,
    actions: <Button>Action</Button>,
  },
};

export const WithCreateButton: Story = {
  args: {
    title: 'My Trips',
    description: 'Plan, organize, and manage all your travel adventures',
    centered: true,
    actions: (
      <Button className="flex items-center rounded-full">
        <PlusCircle className="mr-2 h-4 w-4" />
        Create New
      </Button>
    ),
  },
};

export const LeftAligned: Story = {
  args: {
    title: 'Left Aligned',
    description: 'A left-aligned header.',
    centered: false,
  },
};
