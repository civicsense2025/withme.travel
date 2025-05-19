import type { Meta, StoryObj } from '@storybook/react';
import { WelcomeScreen } from './welcome-screen';

/**
 * The welcome screen is the first screen users see in the onboarding flow,
 * providing options to sign up or log in.
 */
const meta: Meta<typeof WelcomeScreen> = {
  title: 'Features/Onboarding/Organisms/WelcomeScreen',
  component: WelcomeScreen,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof WelcomeScreen>;

/**
 * Default welcome screen
 */
export const Default: Story = {
  args: {
    onNext: () => console.log('Sign up button clicked'),
  },
}; 