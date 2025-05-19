import type { Meta, StoryObj } from '@storybook/react';
import { InterestSelector } from './interest-selector';

/**
 * Storybook for the InterestSelector component that allows users to 
 * select and rate their travel interests during onboarding.
 */
const meta: Meta<typeof InterestSelector> = {
  title: 'Features/Onboarding/Organisms/InterestSelector',
  component: InterestSelector,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof InterestSelector>;

/**
 * Default story with suggested interests
 */
export const Default: Story = {
  args: {
    onComplete: () => console.log('Completed'),
    onBack: () => console.log('Back clicked'),
    onSkip: () => console.log('Skipped'),
    suggestedInterests: {
      'adventure': 70,
      'food-dining': 80,
      'culture': 60,
      'relaxation': 30
    }
  },
};

/**
 * Variant without any suggested interests
 */
export const NoSuggestions: Story = {
  args: {
    onComplete: () => console.log('Completed'),
    onBack: () => console.log('Back clicked'),
    onSkip: () => console.log('Skipped'),
    suggestedInterests: {}
  },
}; 