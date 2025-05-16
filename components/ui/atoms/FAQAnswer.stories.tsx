import type { Meta, StoryObj } from '@storybook/react';
import { FAQAnswer } from './FAQAnswer';

const meta = {
  title: 'FAQ/Atoms/FAQAnswer',
  component: FAQAnswer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    allowHtml: {
      control: 'boolean',
      description: 'Whether to render HTML content in the answer',
    },
  },
} satisfies Meta<typeof FAQAnswer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Plain: Story = {
  args: {
    answer: 'You can create a new trip by clicking the "Create Trip" button on your dashboard or the homepage.',
    allowHtml: false,
  },
};

export const WithHTML: Story = {
  args: {
    answer: 'You can create a new trip by clicking the <strong>Create Trip</strong> button on your dashboard or the homepage. <a href="#">Learn more</a> about trip creation.',
    allowHtml: true,
  },
};

export const WithMarkdownStyling: Story = {
  args: {
    answer: `
      <p>Follow these steps to create a new trip:</p>
      <ol>
        <li>Log in to your account</li>
        <li>Click on "Create Trip" in the navigation</li>
        <li>Enter the trip details including destination and dates</li>
        <li>Invite friends to collaborate (optional)</li>
        <li>Click "Create" to finish</li>
      </ol>
      <p><em>You can edit these details later if needed.</em></p>
    `,
    allowHtml: true,
  },
}; 