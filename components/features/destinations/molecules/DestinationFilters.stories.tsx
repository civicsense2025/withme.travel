import type { Meta, StoryObj } from '@storybook/react';
import { DestinationFilters } from './DestinationFilters';

const meta: Meta<typeof DestinationFilters> = {
  title: 'Features/Destinations/Molecules/DestinationFilters',
  component: DestinationFilters,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    continents: {
      control: 'object',
      description: 'Available continent options',
    },
    countries: {
      control: 'object',
      description: 'Available country options',
    },
    selectedContinents: {
      control: 'object',
      description: 'Currently selected continents',
    },
    selectedCountries: {
      control: 'object',
      description: 'Currently selected countries',
    },
    budgetRanges: {
      control: 'object',
      description: 'Available budget range options',
    },
    selectedBudgetRange: {
      control: 'select',
      options: ['budget', 'mid-range', 'luxury', 'all'],
      description: 'Currently selected budget range',
    },
    onContinentChange: {
      action: 'continent changed',
      description: 'Handler for continent selection changes',
    },
    onCountryChange: {
      action: 'country changed',
      description: 'Handler for country selection changes',
    },
    onBudgetChange: {
      action: 'budget changed',
      description: 'Handler for budget selection changes',
    },
    onClear: {
      action: 'filters cleared',
      description: 'Handler for clearing all filters',
    },
    isCollapsible: {
      control: 'boolean',
      description: 'Whether filters can be collapsed/expanded',
    },
    initiallyExpanded: {
      control: 'boolean',
      description: 'Whether filters should be initially expanded',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DestinationFilters>;

// Sample filter options
const continentOptions = [
  { id: 'europe', name: 'Europe' },
  { id: 'asia', name: 'Asia' },
  { id: 'north-america', name: 'North America' },
  { id: 'south-america', name: 'South America' },
  { id: 'africa', name: 'Africa' },
  { id: 'oceania', name: 'Oceania' },
];

const countryOptions = [
  { id: 'france', name: 'France', continent: 'europe' },
  { id: 'italy', name: 'Italy', continent: 'europe' },
  { id: 'spain', name: 'Spain', continent: 'europe' },
  { id: 'japan', name: 'Japan', continent: 'asia' },
  { id: 'thailand', name: 'Thailand', continent: 'asia' },
  { id: 'usa', name: 'United States', continent: 'north-america' },
  { id: 'canada', name: 'Canada', continent: 'north-america' },
  { id: 'brazil', name: 'Brazil', continent: 'south-america' },
  { id: 'south-africa', name: 'South Africa', continent: 'africa' },
  { id: 'australia', name: 'Australia', continent: 'oceania' },
];

const budgetRangeOptions = [
  { id: 'budget', name: 'Budget-friendly', description: 'Less than $100/day' },
  { id: 'mid-range', name: 'Mid-range', description: '$100-$300/day' },
  { id: 'luxury', name: 'Luxury', description: 'More than $300/day' },
  { id: 'all', name: 'All budgets', description: 'No budget filter' },
];

export const Default: Story = {
  args: {
    continents: continentOptions,
    countries: countryOptions,
    selectedContinents: [],
    selectedCountries: [],
    budgetRanges: budgetRangeOptions,
    selectedBudgetRange: 'all',
    isCollapsible: true,
    initiallyExpanded: true,
  },
};

export const WithPreselectedFilters: Story = {
  args: {
    continents: continentOptions,
    countries: countryOptions,
    selectedContinents: ['europe', 'asia'],
    selectedCountries: ['france', 'japan'],
    budgetRanges: budgetRangeOptions,
    selectedBudgetRange: 'mid-range',
    isCollapsible: true,
    initiallyExpanded: true,
  },
};

export const CollapsedByDefault: Story = {
  args: {
    continents: continentOptions,
    countries: countryOptions,
    selectedContinents: [],
    selectedCountries: [],
    budgetRanges: budgetRangeOptions,
    selectedBudgetRange: 'all',
    isCollapsible: true,
    initiallyExpanded: false,
  },
};

export const NotCollapsible: Story = {
  args: {
    continents: continentOptions,
    countries: countryOptions,
    selectedContinents: [],
    selectedCountries: [],
    budgetRanges: budgetRangeOptions,
    selectedBudgetRange: 'all',
    isCollapsible: false,
  },
};

export const BudgetOnly: Story = {
  args: {
    continents: [],
    countries: [],
    selectedContinents: [],
    selectedCountries: [],
    budgetRanges: budgetRangeOptions,
    selectedBudgetRange: 'budget',
    isCollapsible: true,
    initiallyExpanded: true,
  },
};

export const WithCustomClass: Story = {
  args: {
    continents: continentOptions,
    countries: countryOptions,
    selectedContinents: [],
    selectedCountries: [],
    budgetRanges: budgetRangeOptions,
    selectedBudgetRange: 'all',
    isCollapsible: true,
    initiallyExpanded: true,
    className: 'bg-secondary-50 p-4 rounded-xl',
  },
}; 