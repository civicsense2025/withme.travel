import type { Meta, StoryObj } from '@storybook/react';
import { BasicInfoScreen } from './BasicInfoScreen';

/**
 * The basic info screen allows new users to enter their account information
 * during the onboarding flow.
 */
const meta: Meta<typeof BasicInfoScreen> = {
  title: 'Features/Onboarding/Organisms/BasicInfoScreen',
  component: BasicInfoScreen,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BasicInfoScreen>;

/**
 * Default basic info screen with empty form
 */
export const Default: Story = {
  args: {
    userData: {
      firstName: '',
      email: '',
      password: '',
    },
    onInputChange: (field, value) => console.log(`Field ${field} changed to: ${value}`),
    onNext: () => console.log('Continue clicked'),
    onBack: () => console.log('Back clicked'),
  },
};

/**
 * Basic info screen with pre-filled data
 */
export const WithPrefilledData: Story = {
  args: {
    userData: {
      firstName: 'John',
      email: 'john@example.com',
      password: 'securepassword',
    },
    onInputChange: (field, value) => console.log(`Field ${field} changed to: ${value}`),
    onNext: () => console.log('Continue clicked'),
    onBack: () => console.log('Back clicked'),
  },
}; 