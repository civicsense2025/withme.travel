import type { Meta, StoryObj } from '@storybook/react';
import { ItineraryItemAction } from './ItineraryItemAction';

const meta: Meta<typeof ItineraryItemAction> = {
  title: 'Itinerary/Atoms/ItineraryItemAction',
  component: ItineraryItemAction,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ItineraryItemAction>;

export const Default: Story = {
  args: {
    onEdit: () => console.log('Edit clicked'),
    onDelete: () => console.log('Delete clicked'),
    showActions: true,
    size: 'default',
    showLabels: false,
  },
};

export const WithLabels: Story = {
  args: {
    onEdit: () => console.log('Edit clicked'),
    onDelete: () => console.log('Delete clicked'),
    showActions: true,
    size: 'default',
    showLabels: true,
  },
};

export const SmallSize: Story = {
  args: {
    onEdit: () => console.log('Edit clicked'),
    onDelete: () => console.log('Delete clicked'),
    showActions: true,
    size: 'sm',
    showLabels: false,
  },
};

export const EditOnly: Story = {
  args: {
    onEdit: () => console.log('Edit clicked'),
    showActions: true,
    size: 'default',
    showLabels: false,
  },
};

export const DeleteOnly: Story = {
  args: {
    onDelete: () => console.log('Delete clicked'),
    showActions: true,
    size: 'default',
    showLabels: false,
  },
};

export const Hidden: Story = {
  args: {
    onEdit: () => console.log('Edit clicked'),
    onDelete: () => console.log('Delete clicked'),
    showActions: false,
  },
}; 