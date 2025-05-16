import type { Meta, StoryObj } from '@storybook/react';
import { FAQItem } from './FAQItem';

const meta = {
  title: 'FAQ/Molecules/FAQItem',
  component: FAQItem,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    defaultOpen: {
      control: 'boolean',
      description: 'Whether the accordion is expanded by default',
    },
    allowHtml: {
      control: 'boolean',
      description: 'Whether to render HTML content in the answer',
    },
    onToggle: { action: 'toggled' },
  },
} satisfies Meta<typeof FAQItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    question: 'How do I create a new trip?',
    answer: 'You can create a new trip by clicking the "Create Trip" button on your dashboard or the homepage.',
    allowHtml: false,
    defaultOpen: false,
  },
};

export const Expanded: Story = {
  args: {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards including Visa, Mastercard, and American Express. We also support PayPal for most countries.',
    allowHtml: false,
    defaultOpen: true,
  },
};

export const WithHtmlContent: Story = {
  args: {
    question: 'How do I invite friends to my trip?',
    answer: `
      <p>There are several ways to invite friends:</p>
      <ol>
        <li>From your trip dashboard, click the <strong>"Invite"</strong> button</li>
        <li>Share the unique trip link (available in the trip settings)</li>
        <li>Use the mobile app to send invitations via message, email, or social media</li>
      </ol>
      <p>Friends will receive an email with instructions to join your trip planning.</p>
    `,
    allowHtml: true,
    defaultOpen: true,
  },
}; 