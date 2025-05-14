import type { Meta, StoryObj } from '@storybook/react';
import { TripCreationForm } from './trip-creation-form';

const meta: Meta<typeof TripCreationForm> = {
  title: 'Product/Features/TripCreationForm',
  component: TripCreationForm,
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof TripCreationForm>;

const mockProps = {
  onTripCreated: (tripId: string) => alert('Trip created: ' + tripId),
  onDestinationSelect: (destination: string) => alert('Destination selected: ' + destination),
  onCancel: () => alert('Trip creation cancelled'),
  initialDestination: { id: '1', name: 'Paris', country: 'France' },
  mode: 'light' as 'light',
};

export const Default: Story = { args: { ...mockProps } };
export const LightMode: Story = {
  args: { ...mockProps, mode: 'light' as 'light' },
  parameters: { backgrounds: { default: 'light' } },
};
export const DarkMode: Story = {
  args: { ...mockProps, mode: 'dark' as 'dark' },
  parameters: { backgrounds: { default: 'dark' } },
};
