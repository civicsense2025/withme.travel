import type { Meta, StoryObj } from '@storybook/react';
import { FAQList } from './FAQList';
import { FaqEntry } from '@/types/faq';

const mockFaqs: FaqEntry[] = [
  {
    id: '1',
    question: 'How do I create a new trip?',
    answer: 'You can create a new trip by clicking the "Create Trip" button on your dashboard or the homepage.',
    tags: ['General', 'Getting Started']
  },
  {
    id: '2',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards including Visa, Mastercard, and American Express. We also support PayPal for most countries.',
    tags: ['Payments', 'Billing']
  },
  {
    id: '3',
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
    tags: ['Collaboration', 'Sharing']
  },
  {
    id: '4',
    question: 'Can I export my itinerary to other apps?',
    answer: 'Yes! You can export your itinerary to various calendar apps (Google Calendar, Apple Calendar, Outlook) or as a PDF document for printing or sharing.',
    tags: ['Itineraries', 'Sharing']
  }
];

const meta = {
  title: 'UI/FAQList',
  component: FAQList,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    allowHtml: {
      control: 'boolean',
      description: 'Whether to render HTML content in answers',
    },
  },
} satisfies Meta<typeof FAQList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: mockFaqs,
    allowHtml: true,
  },
};

export const PlainText: Story = {
  args: {
    items: mockFaqs,
    allowHtml: false,
  },
};

export const Empty: Story = {
  args: {
    items: [],
    allowHtml: true,
  },
}; 