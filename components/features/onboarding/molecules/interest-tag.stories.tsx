import type { Meta, StoryObj } from '@storybook/react';
import { InterestTag } from './interest-tag';

/**
 * Storybook for the InterestTag component that displays and allows
 * users to select interest levels for a specific tag during onboarding.
 */
const meta: Meta<typeof InterestTag> = {
  title: 'Features/Onboarding/Molecules/InterestTag',
  component: InterestTag,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof InterestTag>;

/**
 * Default story with a basic tag and no suggestions
 */
export const Default: Story = {
  args: {
    tag: {
      id: '1',
      name: 'Adventure',
      emoji: '🧗‍♂️',
      description: 'Outdoor activities and thrilling experiences',
      slug: 'adventure',
      type: 'travel-interest',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    value: 50,
    isSuggested: false,
    onChange: (value) => console.log('Interest value changed:', value),
  },
};

/**
 * A suggested tag with a high initial value
 */
export const SuggestedTag: Story = {
  args: {
    tag: {
      id: '2',
      name: 'Food & Dining',
      emoji: '🍽️',
      description: 'Culinary experiences and local cuisine',
      slug: 'food-dining',
      type: 'travel-interest',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    value: 80,
    isSuggested: true,
    onChange: (value) => console.log('Interest value changed:', value),
  },
};

/**
 * Tag with no interest level selected
 */
export const NoInterestSelected: Story = {
  args: {
    tag: {
      id: '3',
      name: 'Museums',
      emoji: '🏛️',
      description: 'Historical and cultural institutions',
      slug: 'museums',
      type: 'travel-interest',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    value: 0,
    isSuggested: false,
    onChange: (value) => console.log('Interest value changed:', value),
  },
};

/**
 * Tag without an emoji
 */
export const NoEmoji: Story = {
  args: {
    tag: {
      id: '4',
      name: 'Hiking',
      description: 'Trails and mountain adventures',
      slug: 'hiking',
      type: 'travel-interest',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    value: 60,
    isSuggested: false,
    onChange: (value) => console.log('Interest value changed:', value),
  },
}; 