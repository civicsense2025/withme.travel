import type { Meta, StoryObj } from '@storybook/react';
import { FAQQuestion } from './FAQQuestion';

const meta = {
  title: 'FAQ/Atoms/FAQQuestion',
  component: FAQQuestion,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Whether the question accordion is expanded',
    },
  },
} satisfies Meta<typeof FAQQuestion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    question: 'How do I create a new trip?',
    isOpen: false,
  },
};

export const Open: Story = {
  args: {
    question: 'What payment methods do you accept?',
    isOpen: true,
  },
};

export const LongQuestion: Story = {
  args: {
    question: 'Is there a limit to how many people I can invite to collaborate on my travel plans, and do they all need to create an account to participate?',
    isOpen: false,
  },
}; 