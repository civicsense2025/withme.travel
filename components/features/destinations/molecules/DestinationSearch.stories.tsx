import type { Meta, StoryObj } from '@storybook/react';
import { DestinationSearch } from './DestinationSearch';

const meta: Meta<typeof DestinationSearch> = {
  title: 'Features/Destinations/Molecules/DestinationSearch',
  component: DestinationSearch,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    initialValue: {
      control: 'text',
      description: 'Initial search term value',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the search input',
    },
    onSearch: {
      action: 'searched',
      description: 'Handler called when search is executed',
    },
    onClear: {
      action: 'cleared',
      description: 'Handler called when search is cleared',
    },
    autoFocus: {
      control: 'boolean',
      description: 'Whether to autofocus the search input',
    },
    suggestions: {
      control: 'object',
      description: 'List of search suggestions to display',
    },
    isLoading: {
      control: 'boolean',
      description: 'Whether search results are loading',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DestinationSearch>;

// Sample suggestions
const sampleSuggestions = [
  { id: 'paris', text: 'Paris, France' },
  { id: 'barcelona', text: 'Barcelona, Spain' },
  { id: 'rome', text: 'Rome, Italy' },
  { id: 'tokyo', text: 'Tokyo, Japan' },
  { id: 'new-york', text: 'New York, USA' },
];

export const Default: Story = {
  args: {
    placeholder: 'Search destinations...',
    autoFocus: false,
  },
};

export const WithInitialValue: Story = {
  args: {
    initialValue: 'Paris',
    placeholder: 'Search destinations...',
    autoFocus: false,
  },
};

export const WithSuggestions: Story = {
  args: {
    placeholder: 'Search destinations...',
    suggestions: sampleSuggestions,
    autoFocus: false,
  },
};

export const WithAutoFocus: Story = {
  args: {
    placeholder: 'Search destinations...',
    autoFocus: true,
  },
};

export const Loading: Story = {
  args: {
    initialValue: 'Barce',
    placeholder: 'Search destinations...',
    isLoading: true,
    autoFocus: false,
  },
};

export const WithCustomPlaceholder: Story = {
  args: {
    placeholder: 'Where do you want to go?',
    autoFocus: false,
  },
};

export const WithCustomClass: Story = {
  args: {
    placeholder: 'Search destinations...',
    className: 'max-w-md mx-auto shadow-lg',
    autoFocus: false,
  },
}; 