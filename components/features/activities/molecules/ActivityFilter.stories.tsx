import type { Meta, StoryObj } from '@storybook/react';
import { ActivityFilter } from './ActivityFilter';

const meta: Meta<typeof ActivityFilter> = {
  title: 'Features/Activities/Molecules/ActivityFilter',
  component: ActivityFilter,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    selectedTypes: {
      control: 'object',
      description: 'Array of currently selected activity types',
    },
    selectedEntities: {
      control: 'object',
      description: 'Array of currently selected entity types',
    },
    dateRange: {
      control: 'object',
      description: 'Date range for filtering activities',
    },
    userFilter: {
      control: 'text',
      description: 'Filter by specific user',
    },
    onFilterChange: { action: 'filter changed' },
    isCollapsible: {
      control: 'boolean',
      description: 'Whether the filter can be collapsed',
    },
    isCollapsed: {
      control: 'boolean',
      description: 'Whether the filter is currently collapsed',
    },
    onToggleCollapse: { action: 'toggle collapsed' },
  },
};

export default meta;
type Story = StoryObj<typeof ActivityFilter>;

export const Default: Story = {
  args: {
    selectedTypes: [],
    selectedEntities: [],
    dateRange: { start: null, end: null },
    userFilter: '',
    isCollapsible: true,
    isCollapsed: false,
  },
};

export const WithPreselectedFilters: Story = {
  args: {
    selectedTypes: ['comment', 'create'],
    selectedEntities: ['trip'],
    dateRange: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
    },
    userFilter: '',
    isCollapsible: true,
    isCollapsed: false,
  },
};

export const WithUserFilter: Story = {
  args: {
    selectedTypes: [],
    selectedEntities: [],
    dateRange: { start: null, end: null },
    userFilter: 'John Smith',
    isCollapsible: true,
    isCollapsed: false,
  },
};

export const Collapsed: Story = {
  args: {
    selectedTypes: ['comment', 'create'],
    selectedEntities: ['trip'],
    dateRange: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
    },
    userFilter: 'John Smith',
    isCollapsible: true,
    isCollapsed: true,
  },
};

export const NotCollapsible: Story = {
  args: {
    selectedTypes: [],
    selectedEntities: [],
    dateRange: { start: null, end: null },
    userFilter: '',
    isCollapsible: false,
    isCollapsed: false,
  },
}; 