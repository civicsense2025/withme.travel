import type { Meta, StoryObj } from '@storybook/react';
import { QuickAddItemForm } from './QuickAddItemForm';

const meta: Meta<typeof QuickAddItemForm> = {
  title: 'Trip Features/QuickAddItemForm',
  component: QuickAddItemForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof QuickAddItemForm>;

export const Default: Story = {
  args: {
    tripId: 'trip-123',
    proximityLat: 41.3851,
    proximityLng: 2.1734,
  },
};

export const RequiredOnly: Story = {
  args: {
    tripId: 'trip-456',
  },
};
