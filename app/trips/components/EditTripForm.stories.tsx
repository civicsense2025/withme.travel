import type { Meta, StoryObj } from '@storybook/react';
import { EditTripForm, EditTripFormValues } from './EditTripForm';

const meta: Meta<typeof EditTripForm> = {
  title: 'Trip Features/EditTripForm',
  component: EditTripForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EditTripForm>;

const mockTrip = {
  id: 'trip-1',
  name: 'Summer in Spain',
  start_date: '2024-07-01',
  end_date: '2024-07-14',
  destination_id: 'dest-1',
  cover_image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
  privacy_setting: 'private' as const,
  tags: ['beach', 'food'],
};

const mockOnSave = (data: EditTripFormValues) => {
  alert('Saved! ' + JSON.stringify(data));
};
const mockOnClose = () => alert('Closed!');

export const Default: Story = {
  args: {
    trip: mockTrip,
    initialDestinationName: 'Barcelona',
    onSave: mockOnSave,
    onClose: mockOnClose,
  },
};

export const PublicTrip: Story = {
  args: {
    ...Default.args,
    trip: {
      ...mockTrip,
      privacy_setting: 'public' as const,
    },
  },
};

export const Light = {
  parameters: { backgrounds: { default: 'light' } },
};

export const Dark = {
  parameters: { backgrounds: { default: 'dark' } },
};
