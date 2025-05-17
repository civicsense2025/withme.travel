import type { Meta, StoryObj } from '@storybook/react';
import { TripPlanningFAQ } from './TripPlanningFAQ';
import { FaqEntry } from '@/types/faq';

// Custom trip planning FAQ items for story variations
const customTripFaqs: FaqEntry[] = [
  {
    id: 'custom-trip-1',
    question: 'How can I plan a family-friendly trip?',
    answer: `
      <p>Planning a family-friendly trip involves considering several factors:</p>
      <ul>
        <li>Choose accommodations with family amenities (pools, play areas, etc.)</li>
        <li>Balance activities that appeal to different age groups</li>
        <li>Plan for slower travel pace with more downtime</li>
        <li>Research child-friendly dining options in advance</li>
        <li>Consider safety features like room childproofing or beach conditions</li>
      </ul>
      <p>Our platform allows you to filter for family-friendly accommodations and activities to make planning easier.</p>
    `,
    tags: ['Family Travel', 'Planning']
  },
  {
    id: 'custom-trip-2',
    question: 'What are some tips for planning a budget trip?',
    answer: `
      <p>Planning an affordable trip without sacrificing experience:</p>
      <ol>
        <li>Travel during shoulder seasons (just before or after peak season)</li>
        <li>Set fare alerts to catch flight deals</li>
        <li>Consider alternative accommodations like hostels or apartment rentals</li>
        <li>Mix free attractions with paid ones</li>
        <li>Eat like a local - street food and markets are often affordable and authentic</li>
        <li>Look for city passes that bundle attractions at a discount</li>
      </ol>
      <p>Our budget planning tool can help you track expenses and find affordable options.</p>
    `,
    tags: ['Budget Travel', 'Planning']
  }
];

const meta = {
  title: 'UI/Features/trips/TripPlanningFAQ',
  component: TripPlanningFAQ,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    replaceDefault: {
      control: 'boolean',
      description: 'Whether to replace default items with custom ones',
    },
    layout: {
      control: 'select',
      options: ['default', 'compact', 'grid'],
      description: 'Layout variant',
    },
  },
} satisfies Meta<typeof TripPlanningFAQ>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Trip Planning FAQ',
    description: 'Find answers to common questions about planning trips with friends and family.',
    layout: 'default',
  },
};

export const CompactLayout: Story = {
  args: {
    title: 'Trip Planning FAQ',
    description: 'Quick answers to common trip planning questions.',
    layout: 'compact',
  },
};

export const GridLayout: Story = {
  args: {
    title: 'Trip Planning FAQ',
    description: 'Find answers to common questions about planning trips with friends and family.',
    layout: 'grid',
  },
};

export const WithCustomItems: Story = {
  args: {
    customItems: customTripFaqs,
    replaceDefault: false,
    title: 'Trip Planning Resources',
    description: 'Get answers to all your trip planning questions.',
    layout: 'default',
  },
}; 