import type { Meta, StoryObj } from '@storybook/react';
import { FAQFilter } from './FAQFilter';

const availableTags = [
  'General', 
  'Getting Started', 
  'Payments', 
  'Billing', 
  'Collaboration', 
  'Sharing', 
  'Itineraries',
  'Privacy',
  'Account'
];

const meta = {
  title: 'FAQ/Molecules/FAQFilter',
  component: FAQFilter,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    showSearch: {
      control: 'boolean',
      description: 'Whether to show the search input',
    },
    onTagsChange: { action: 'tagsChanged' },
    onSearchChange: { action: 'searchChanged' },
  },
} satisfies Meta<typeof FAQFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    tags: availableTags,
    selectedTags: [],
    searchQuery: '',
    showSearch: true,
  },
};

export const WithSelectedTags: Story = {
  args: {
    tags: availableTags,
    selectedTags: ['Payments', 'Billing'],
    searchQuery: '',
    showSearch: true,
  },
};

export const WithSearchQuery: Story = {
  args: {
    tags: availableTags,
    selectedTags: [],
    searchQuery: 'payment methods',
    showSearch: true,
  },
};

export const WithoutSearch: Story = {
  args: {
    tags: availableTags,
    selectedTags: ['General'],
    searchQuery: '',
    showSearch: false,
  },
}; 