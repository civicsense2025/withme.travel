import type { Meta, StoryObj } from '@storybook/react';
import { DestinationRegionSelector } from './DestinationRegionSelector';

const meta: Meta<typeof DestinationRegionSelector> = {
  title: 'Features/Destinations/Molecules/DestinationRegionSelector',
  component: DestinationRegionSelector,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    regions: {
      control: 'object',
      description: 'Available regions to select from',
    },
    selectedRegions: {
      control: 'object',
      description: 'Currently selected regions',
    },
    onChange: {
      action: 'region selection changed',
      description: 'Handler for when region selection changes',
    },
    variant: {
      control: 'select',
      options: ['chips', 'dropdown', 'buttons'],
      description: 'Visual display variant for the selector',
    },
    expandable: {
      control: 'boolean',
      description: 'Whether the selector can expand/collapse',
    },
    maxVisible: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'Maximum number of regions to show before "more" indicator',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DestinationRegionSelector>;

// Sample regions data
const regions = [
  { id: 'europe', name: 'Europe', count: 156 },
  { id: 'asia', name: 'Asia', count: 128 },
  { id: 'north-america', name: 'North America', count: 98 },
  { id: 'south-america', name: 'South America', count: 65 },
  { id: 'africa', name: 'Africa', count: 87 },
  { id: 'oceania', name: 'Oceania', count: 42 },
  { id: 'caribbean', name: 'Caribbean', count: 29 },
  { id: 'middle-east', name: 'Middle East', count: 38 },
];

export const Default: Story = {
  args: {
    regions,
    selectedRegions: [],
    variant: 'chips',
    expandable: true,
    maxVisible: 5,
  },
};

export const WithSelections: Story = {
  args: {
    regions,
    selectedRegions: ['europe', 'asia'],
    variant: 'chips',
    expandable: true,
    maxVisible: 5,
  },
};

export const DropdownVariant: Story = {
  args: {
    regions,
    selectedRegions: ['north-america'],
    variant: 'dropdown',
    expandable: false,
  },
};

export const ButtonsVariant: Story = {
  args: {
    regions,
    selectedRegions: ['south-america', 'caribbean'],
    variant: 'buttons',
    expandable: false,
  },
};

export const LimitedVisible: Story = {
  args: {
    regions,
    selectedRegions: [],
    variant: 'chips',
    expandable: true,
    maxVisible: 3,
  },
};

export const NonExpandable: Story = {
  args: {
    regions,
    selectedRegions: ['europe'],
    variant: 'chips',
    expandable: false,
    maxVisible: 5,
  },
}; 