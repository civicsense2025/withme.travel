import type { Meta, StoryObj } from '@storybook/react';
import { FAQTag } from './FAQTag';

const meta = {
  title: 'UI/FAQTag',
  component: FAQTag,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary'],
      description: 'Visual style variant for the tag',
    },
  },
} satisfies Meta<typeof FAQTag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'General',
    variant: 'default',
  },
};

export const Selected: Story = {
  args: {
    children: 'Payments',
    variant: 'primary',
  },
};

export const LongTag: Story = {
  args: {
    children: 'Collaborative Planning',
    variant: 'default',
  },
};

export const TagGroup: Story = {
  args: {
    children: 'Example',
    variant: 'default',
  },
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      <FAQTag variant="primary">All</FAQTag>
      <FAQTag>Account</FAQTag>
      <FAQTag>Planning</FAQTag>
      <FAQTag>Payments</FAQTag>
      <FAQTag>Privacy</FAQTag>
    </div>
  ),
}; 