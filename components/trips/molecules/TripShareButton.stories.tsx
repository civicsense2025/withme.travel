import type { Meta, StoryObj } from '@storybook/react';
import { TripShareButton } from './TripShareButton';

const meta: Meta<typeof TripShareButton> = {
  title: 'Trips/Molecules/TripShareButton',
  component: TripShareButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onShare: { action: 'shared' },
    label: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '200px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TripShareButton>;

export const Default: Story = {
  args: {
    tripId: 'trip-123',
    label: 'Share',
  },
};

export const CustomLabel: Story = {
  args: {
    ...Default.args,
    label: 'Invite Friends',
  },
}; 