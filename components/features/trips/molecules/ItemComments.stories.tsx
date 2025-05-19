import type { Meta, StoryObj } from '@storybook/react';
import { ItemComments } from '@/components/features/trips/molecules/ItemComments';

const meta: Meta<typeof ItemComments> = {
  title: 'Product/Features/ItemComments',
  component: ItemComments,
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof ItemComments>;

const mockProps = {
  itemId: 'item-1',
  comments: [
    {
      id: 'c1',
      author: 'Alice',
      text: 'Great idea!',
    },
    {
      id: 'c2',
      author: 'Bob',
      text: "Let's do it!",
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
