import type { Meta, StoryObj } from '@storybook/react';
import { BudgetSnapshotSidebar } from './BudgetSnapshotSidebar';

const meta: Meta<typeof BudgetSnapshotSidebar> = {
  title: 'Features/Trips/Molecules/BudgetSnapshotSidebar',
  component: BudgetSnapshotSidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    targetBudget: {
      control: 'number',
      description: 'Target budget amount (null if not set)',
    },
    totalPlanned: {
      control: 'number',
      description: 'Total planned expenses',
    },
    totalSpent: {
      control: 'number',
      description: 'Total spent amount',
    },
    canEdit: {
      control: 'boolean',
      description: 'Whether the user can edit the budget',
    },
    isEditing: {
      control: 'boolean',
      description: 'Whether editing mode is active',
    },
    onEditToggle: {
      action: 'edit toggled',
      description: 'Called when editing mode is toggled',
    },
    onSave: {
      action: 'budget saved',
      description: 'Called when a new budget is saved',
    },
    onLogExpenseClick: {
      action: 'log expense clicked',
      description: 'Called when the Log Expense button is clicked',
    },
    noCardWrapper: {
      control: 'boolean',
      description: 'Whether to render without a Card wrapper',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BudgetSnapshotSidebar>;

export const Default: Story = {
  args: {
    targetBudget: 1000,
    totalPlanned: 300,
    totalSpent: 250,
    canEdit: true,
    isEditing: false,
    noCardWrapper: false,
  },
};

export const NoBudgetSet: Story = {
  args: {
    targetBudget: null,
    totalPlanned: 300,
    totalSpent: 250,
    canEdit: true,
    isEditing: false,
    noCardWrapper: false,
  },
};

export const EditingMode: Story = {
  args: {
    targetBudget: 1000,
    totalPlanned: 300,
    totalSpent: 250,
    canEdit: true,
    isEditing: true,
    noCardWrapper: false,
  },
};

export const OverBudget: Story = {
  args: {
    targetBudget: 500,
    totalPlanned: 300,
    totalSpent: 400,
    canEdit: true,
    isEditing: false,
    noCardWrapper: false,
  },
};

export const HighProgressBudget: Story = {
  args: {
    targetBudget: 1000,
    totalPlanned: 300,
    totalSpent: 600,
    canEdit: true,
    isEditing: false,
    noCardWrapper: false,
  },
};

export const ReadOnly: Story = {
  args: {
    targetBudget: 1000,
    totalPlanned: 300,
    totalSpent: 250,
    canEdit: false,
    isEditing: false,
    noCardWrapper: false,
  },
};

export const NoCardWrapper: Story = {
  args: {
    targetBudget: 1000,
    totalPlanned: 300,
    totalSpent: 250,
    canEdit: true,
    isEditing: false,
    noCardWrapper: true,
  },
  parameters: {
    backgrounds: { default: 'light' },
  },
}; 