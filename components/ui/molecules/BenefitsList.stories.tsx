import { Meta, StoryObj } from '@storybook/react';
import { BenefitsList } from './BenefitsList';

const meta: Meta<typeof BenefitsList> = {
  title: 'UI/BenefitsList',
  component: BenefitsList,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    benefits: {
      control: 'object',
      description: 'Array of benefits to display',
    },
    heading: {
      control: 'text',
      description: 'Heading text for the benefits section',
    },
    cardStyle: {
      control: 'boolean',
      description: 'Whether to show benefits in card style',
    },
  },
};

export default meta;

type Story = StoryObj<typeof BenefitsList>;

// Sample benefits data
const sampleBenefits = [
  { emoji: '🔍', text: 'First look at new features before anyone else' },
  { emoji: '🗺️', text: 'Shape our roadmap with your real travel insights' },
  { emoji: '🤝', text: 'Connect with fellow adventure planners' },
  { emoji: '✨', text: 'Enjoy a free lifetime plan as an alpha tester' },
];

// Default view with card style
export const Default: Story = {
  args: {
    benefits: sampleBenefits,
    heading: 'When you join, you\'ll get:',
    cardStyle: true,
  },
};

// List style without cards
export const ListStyle: Story = {
  args: {
    benefits: sampleBenefits,
    heading: 'When you join, you\'ll get:',
    cardStyle: false,
  },
};

// No heading
export const NoHeading: Story = {
  args: {
    benefits: sampleBenefits,
    heading: '', // Empty heading
    cardStyle: true,
  },
};

// Custom heading
export const CustomHeading: Story = {
  args: {
    benefits: sampleBenefits,
    heading: 'Membership Benefits:',
    cardStyle: true,
  },
};

// Single benefit
export const SingleBenefit: Story = {
  args: {
    benefits: [sampleBenefits[0]],
    heading: 'Key Benefit:',
    cardStyle: true,
  },
};

// Many benefits
export const ManyBenefits: Story = {
  args: {
    benefits: [
      ...sampleBenefits,
      { emoji: '📱', text: 'Access to exclusive mobile features' },
      { emoji: '💬', text: 'Direct feedback channel to our product team' },
      { emoji: '🎁', text: 'Special perks and early access to new destinations' },
    ],
    heading: 'All Benefits:',
    cardStyle: true,
  },
}; 