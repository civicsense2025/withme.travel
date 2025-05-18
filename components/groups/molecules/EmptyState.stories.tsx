import type { Meta, StoryObj } from '@storybook/react';
import { Plus, Map, Calendar, Users, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from './EmptyState';

const meta: Meta<typeof EmptyState> = {
  title: 'Groups/Molecules/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    action: { control: 'none' },
    icon: { control: 'none' },
    iconBackground: { control: 'text' },
    layout: {
      control: { type: 'radio' },
      options: ['vertical', 'horizontal'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

// Common action to reuse
const defaultAction = <Button><Plus className="mr-2 h-4 w-4" /> Create New</Button>;

export const Default: Story = {
  args: {
    title: 'No items found',
    description: 'Get started by creating your first item',
    action: defaultAction,
    icon: <Plus className="h-6 w-6" />,
  },
};

export const Horizontal: Story = {
  args: {
    title: 'No trips yet',
    description: 'Create your first trip to get started with planning',
    action: <Button size="sm">Create Trip</Button>,
    icon: <Map className="h-5 w-5" />,
    layout: 'horizontal',
  },
};

export const NoIcon: Story = {
  args: {
    title: 'No events scheduled',
    description: 'Add your first event to the calendar',
    action: <Button variant="outline">Add Event</Button>,
  },
};

export const CustomColors: Story = {
  args: {
    title: 'No group members',
    description: 'Invite friends to join your group',
    action: <Button variant="secondary">Send Invites</Button>,
    icon: <Users className="h-6 w-6 text-indigo-500" />,
    iconBackground: 'bg-indigo-100',
  },
};

export const Error: Story = {
  args: {
    title: 'Error loading data',
    description: 'There was a problem loading your content. Please try again.',
    action: <Button variant="destructive">Retry</Button>,
    icon: <AlertCircle className="h-6 w-6 text-red-500" />,
    iconBackground: 'bg-red-100',
  },
}; 