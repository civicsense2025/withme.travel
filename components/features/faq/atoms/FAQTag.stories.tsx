import type { Meta, StoryObj } from '@storybook/react';
import { FAQTag } from './FAQTag';

const meta = {
  title: 'FAQ/Atoms/FAQTag',
  component: FAQTag,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    isSelected: {
      control: 'boolean',
      description: 'Whether the tag is selected/active',
    },
    onClick: { action: 'clicked' },
  },
} satisfies Meta<typeof FAQTag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    tag: 'General',
    isSelected: false,
  },
};

export const Selected: Story = {
  args: {
    tag: 'Payments',
    isSelected: true,
  },
};

export const LongTag: Story = {
  args: {
    tag: 'Collaborative Planning',
    isSelected: false,
  },
};

export const TagGroup: Story = {
  args: {
    tag: 'Example',
    isSelected: false,
  },
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      <FAQTag tag="All" isSelected={true} />
      <FAQTag tag="Account" />
      <FAQTag tag="Planning" />
      <FAQTag tag="Payments" />
      <FAQTag tag="Privacy" />
    </div>
  ),
}; 