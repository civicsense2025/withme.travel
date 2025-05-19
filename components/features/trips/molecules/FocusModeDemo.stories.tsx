import type { Meta, StoryObj } from '@storybook/react';
import { FocusModeDemo } from './FocusModeDemo';

const meta: Meta<typeof FocusModeDemo> = {
  title: 'Features/Trips/Molecules/FocusModeDemo',
  component: FocusModeDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    tripId: {
      control: 'text',
      description: 'ID of the trip',
    },
  },
};

export default meta;
type Story = StoryObj<typeof FocusModeDemo>;

export const Default: Story = {
  args: {
    tripId: 'trip-123',
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays a focus mode card with a toggle to show/hide the actual focus mode component',
      },
    },
  },
}; 