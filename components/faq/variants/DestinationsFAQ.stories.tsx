import type { Meta, StoryObj } from '@storybook/react';
import { DestinationsFAQ } from './DestinationsFAQ';
import { FaqEntry } from '@/types/faq';

// Custom destination FAQ items for story variations
const customDestinationFaqs: FaqEntry[] = [
  {
    id: 'custom-1',
    question: 'What are the popular attractions in Tokyo?',
    answer: `
      <p>Tokyo offers a wealth of attractions for visitors:</p>
      <ul>
        <li><strong>Shinjuku Gyoen National Garden</strong> - Beautiful traditional gardens</li>
        <li><strong>Tokyo Skytree</strong> - One of the tallest structures in the world</li>
        <li><strong>Senso-ji Temple</strong> - Ancient Buddhist temple in Asakusa</li>
        <li><strong>Shibuya Crossing</strong> - Iconic pedestrian scramble</li>
        <li><strong>Meiji Shrine</strong> - Peaceful Shinto shrine within a forest</li>
      </ul>
      <p>Tokyo also offers excellent shopping districts like Ginza and Harajuku, plus world-class food experiences throughout the city.</p>
    `,
    tags: ['Tokyo', 'Attractions']
  },
  {
    id: 'custom-2',
    question: 'What is the best way to get around Paris?',
    answer: `
      <p>Paris has an excellent public transportation system:</p>
      <ul>
        <li><strong>Métro</strong> - Fast and extensive subway network</li>
        <li><strong>RER</strong> - Regional express trains connecting suburbs</li>
        <li><strong>Bus</strong> - More scenic but slower option</li>
        <li><strong>Vélib'</strong> - Bike-sharing program for short trips</li>
        <li><strong>Walking</strong> - Many attractions are within walking distance</li>
      </ul>
      <p>Consider purchasing a Paris Visite pass for unlimited travel on public transportation if you plan to use it frequently.</p>
    `,
    tags: ['Paris', 'Transportation']
  }
];

const meta = {
  title: 'FAQ/Variants/DestinationsFAQ',
  component: DestinationsFAQ,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    replaceDefault: {
      control: 'boolean',
      description: 'Whether to replace default items with custom ones',
    },
    showFilter: {
      control: 'boolean',
      description: 'Whether to show the filter interface',
    },
  },
} satisfies Meta<typeof DestinationsFAQ>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Destinations FAQ',
    description: 'Find answers to common questions about planning trips to various destinations.',
    showFilter: true,
  },
};

export const WithCustomItems: Story = {
  args: {
    customItems: customDestinationFaqs,
    replaceDefault: false,
    title: 'Asia Travel FAQ',
    description: 'Essential information for planning your trip to Asia.',
    showFilter: true,
  },
};

export const CustomItemsOnly: Story = {
  args: {
    customItems: customDestinationFaqs,
    replaceDefault: true,
    title: 'City Guides FAQ',
    description: 'Specific information about getting around major cities.',
    showFilter: true,
  },
};