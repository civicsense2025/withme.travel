import type { Meta, StoryObj } from '@storybook/react';
import { AppTourScreen } from './AppTourScreen';

/**
 * The app tour screen introduces key features of the application 
 * to new users with an interactive slideshow.
 */
const meta: Meta<typeof AppTourScreen> = {
  title: 'Features/Onboarding/Organisms/AppTourScreen',
  component: AppTourScreen,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AppTourScreen>;

/**
 * Default app tour screen starting at the first slide
 */
export const Default: Story = {
  args: {
    onNext: () => console.log('Next/continue clicked'),
    onBack: () => console.log('Back clicked on first step'),
    onSkip: () => console.log('Skip tour clicked'),
  },
}; 