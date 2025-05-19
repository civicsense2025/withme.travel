import type { Meta, StoryObj } from '@storybook/react';
import { DestinationCategorySelector } from './DestinationCategorySelector';

const meta: Meta<typeof DestinationCategorySelector> = {
  title: 'Features/Destinations/Molecules/DestinationCategorySelector',
  component: DestinationCategorySelector,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    categories: {
      control: 'object',
      description: 'Available destination categories',
    },
    selectedCategory: {
      control: 'text',
      description: 'Currently selected category ID',
    },
    onChange: {
      action: 'category changed',
      description: 'Handler for when category selection changes',
    },
    variant: {
      control: 'select',
      options: ['tabs', 'buttons', 'dropdown'],
      description: 'Visual display variant for the selector',
    },
    showAllOption: {
      control: 'boolean',
      description: 'Whether to show an "All" option',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DestinationCategorySelector>;

// Sample categories data
const categories = [
  { id: 'beach', name: 'Beach Destinations', icon: '🏖️' },
  { id: 'city', name: 'City Breaks', icon: '🏙️' },
  { id: 'mountains', name: 'Mountain Retreats', icon: '⛰️' },
  { id: 'countryside', name: 'Countryside', icon: '🌄' },
  { id: 'islands', name: 'Islands', icon: '🏝️' },
  { id: 'historic', name: 'Historic Sites', icon: '🏛️' },
];

export const Default: Story = {
  args: {
    categories,
    selectedCategory: '',
    variant: 'tabs',
    showAllOption: true,
  },
};

export const WithSelection: Story = {
  args: {
    categories,
    selectedCategory: 'beach',
    variant: 'tabs',
    showAllOption: true,
  },
};

export const ButtonsVariant: Story = {
  args: {
    categories,
    selectedCategory: 'city',
    variant: 'buttons',
    showAllOption: true,
  },
};

export const DropdownVariant: Story = {
  args: {
    categories,
    selectedCategory: 'mountains',
    variant: 'dropdown',
    showAllOption: true,
  },
};

export const WithoutAllOption: Story = {
  args: {
    categories,
    selectedCategory: 'islands',
    variant: 'tabs',
    showAllOption: false,
  },
}; 