import type { Meta, StoryObj } from '@storybook/react';
import { DestinationMetaBadges } from './DestinationMetaBadges';

const meta: Meta<typeof DestinationMetaBadges> = {
  title: 'Destinations/Molecules/DestinationMetaBadges',
  component: DestinationMetaBadges,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    continent: { 
      control: 'text',
      description: 'The continent name'
    },
    bestSeason: {
      control: 'text',
      description: 'The best season to visit'
    },
    avgCostPerDay: {
      control: 'number',
      description: 'Average cost per day in USD'
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes'
    }
  },
};

export default meta;
type Story = StoryObj<typeof DestinationMetaBadges>;

export const Default: Story = {
  args: {
    continent: 'Europe',
    bestSeason: 'Summer',
    avgCostPerDay: 120,
  },
};

export const ContinentOnly: Story = {
  args: {
    continent: 'Asia',
  },
};

export const SeasonOnly: Story = {
  args: {
    bestSeason: 'Spring',
  },
};

export const CostOnly: Story = {
  args: {
    avgCostPerDay: 85,
  },
};

export const Complete: Story = {
  args: {
    continent: 'North America',
    bestSeason: 'Fall',
    avgCostPerDay: 150,
  },
};

export const ExpensiveDestination: Story = {
  args: {
    continent: 'Europe',
    bestSeason: 'Summer',
    avgCostPerDay: 300,
  },
};

export const BudgetDestination: Story = {
  args: {
    continent: 'Southeast Asia',
    bestSeason: 'Winter',
    avgCostPerDay: 40,
  },
}; 