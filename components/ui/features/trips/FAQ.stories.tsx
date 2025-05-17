import type { Meta, StoryObj } from '@storybook/react';
import { FAQ } from './FAQ';
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
  },
  {
    id: '5',
    question: 'How do I change my account settings?',
    answer: 'To change your account settings, click on your profile icon in the top right corner and select "Settings" from the dropdown menu. From there, you can update your profile information, notification preferences, privacy settings, and connected accounts.',
    tags: ['Account', 'Settings']
  },
  {
    id: '6',
    question: 'Is my payment information secure?',
    answer: 'Yes, we take security seriously. We never store your full credit card details on our servers. All payment processing is handled by our secure payment providers who use industry-standard encryption. We are also PCI DSS compliant to ensure maximum security for all transactions.',
    tags: ['Payments', 'Security']
  }
];

const meta = {
  title: 'UI/Features/trips/FAQ',
  component: FAQ,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    layout: {
      control: 'select',
      options: ['default', 'sidebar', 'inline', 'grid', 'compact'],
      description: 'Layout variant for the FAQ',
    },
    showFilter: {
      control: 'boolean',
      description: 'Whether to show the filter interface',
    },
    showSearch: {
      control: 'boolean',
      description: 'Whether to show the search input',
    },
    allowHtml: {
      control: 'boolean',
      description: 'Whether to render HTML content in answers',
    },
    structuredData: {
      control: 'boolean',
      description: 'Whether to include schema.org structured data',
    },
  },
} satisfies Meta<typeof FAQ>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: mockFaqs,
    title: 'Frequently Asked Questions',
    layout: 'default',
    showFilter: true,
    showSearch: true,
    allowHtml: true,
    structuredData: true,
  },
};

export const Sidebar: Story = {
  args: {
    items: mockFaqs,
    title: 'Frequently Asked Questions',
    description: 'Find answers to the most common questions about our platform.',
    layout: 'sidebar',
    showFilter: true,
    showSearch: true,
    allowHtml: true,
  },
};

export const Grid: Story = {
  args: {
    items: mockFaqs,
    title: 'Frequently Asked Questions',
    layout: 'grid',
    showFilter: true,
    showSearch: true,
    allowHtml: true,
  },
};

export const Compact: Story = {
  args: {
    items: mockFaqs,
    title: 'Frequently Asked Questions',
    layout: 'compact',
    showFilter: false,
    showSearch: false,
    allowHtml: true,
  },
};

export const NoFilter: Story = {
  args: {
    items: mockFaqs,
    title: 'Frequently Asked Questions',
    layout: 'default',
    showFilter: false,
    allowHtml: true,
  },
}; 