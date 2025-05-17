import type { Meta, StoryObj } from '@storybook/react';
import { FAQQuestion } from './FAQQuestion';

const meta = {
  title: 'UI/FAQQuestion',
  component: FAQQuestion,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FAQQuestion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'How do I create a new trip?',
  },
};

export const Styled: Story = {
  args: {
    children: 'What payment methods do you accept?',
    className: 'text-primary font-bold',
  },
};

export const LongQuestion: Story = {
  args: {
    children: 'Is there a limit to how many people I can invite to collaborate on my travel plans, and do they all need to create an account to participate?',
  },
}; 