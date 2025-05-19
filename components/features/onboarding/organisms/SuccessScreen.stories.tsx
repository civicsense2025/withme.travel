import type { Meta, StoryObj } from '@storybook/react';
import { SuccessScreen } from '@/components/features/onboarding/organisms/SuccessScreen';

/**
 * The success screen is shown after successful registration,
 * welcoming the user and letting them continue to the app.
 */
const meta: Meta<typeof SuccessScreen> = {
  title: 'Features/Onboarding/Organisms/SuccessScreen',
  component: SuccessScreen,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SuccessScreen>;

/**
 * Default success screen with default username
 */
export const Default: Story = {
  args: {
    onComplete: () => console.log('Get started clicked'),
  },
};

/**
 * Success screen with custom user name
 */
export const WithUserName: Story = {
  args: {
    userName: 'Sarah',
    onComplete: () => console.log('Get started clicked'),
  },
}; 