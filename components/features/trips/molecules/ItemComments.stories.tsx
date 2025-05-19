import type { Meta, StoryObj } from '@storybook/react';
import { ItemComments } from './ItemComments';

const meta: Meta<typeof ItemComments> = {
  title: 'Features/Trips/Molecules/ItemComments',
  component: ItemComments,
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof ItemComments>;

const mockProps = {
  itemId: 'item-1',
  tripId: 'trip-1',
  comments: [
    {
      id: 'c1',
      user: { name: 'Alice' },
      content: 'Great idea!',
      created_at: '2024-07-01T10:00:00Z',
    },
    {
      id: 'c2',
      user: { name: 'Bob' },
      content: "Let's do it!",
      created_at: '2024-07-01T11:00:00Z',
    },
  ],
  onAddComment: (text: string) => alert('Add comment: ' + text),
};

export const Default: Story = { args: { ...mockProps } };
export const LightMode: Story = {
  args: { ...mockProps },
  parameters: { backgrounds: { default: 'light' } },
};
export const DarkMode: Story = {
  args: { ...mockProps },
  parameters: { backgrounds: { default: 'dark' } },
}; 