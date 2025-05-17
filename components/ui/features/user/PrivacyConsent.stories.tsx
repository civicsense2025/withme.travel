import { Meta, StoryObj } from '@storybook/react';
import { PrivacyConsent } from './PrivacyConsent';

const meta: Meta<typeof PrivacyConsent> = {
  title: 'UI/Features/user/PrivacyConsent',
  component: PrivacyConsent,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    message: {
      control: 'text',
      description: 'Privacy message to display',
    },
    showHeading: {
      control: 'boolean',
      description: 'Whether to show the heading',
    },
    heading: {
      control: 'text',
      description: 'Heading text',
    },
  },
};

export default meta;

type Story = StoryObj<typeof PrivacyConsent>;

// Default view
export const Default: Story = {
  args: {
    message: 'We respect your privacy. Your info is only used for the user testing program. Opt out anytime.',
    showHeading: true,
    heading: 'Privacy & Consent:',
  },
};

// Without heading
export const WithoutHeading: Story = {
  args: {
    message: 'We respect your privacy. Your info is only used for the user testing program. Opt out anytime.',
    showHeading: false,
  },
};

// With custom heading
export const CustomHeading: Story = {
  args: {
    message: 'We respect your privacy. Your info is only used for the user testing program. Opt out anytime.',
    showHeading: true,
    heading: 'Important Notice:',
  },
};

// Long message
export const LongMessage: Story = {
  args: {
    message: 'We respect your privacy. Your information will only be used for the user testing program and will never be shared with third parties. You can opt out of this program at any time by contacting our support team or updating your preferences in your account settings.',
    showHeading: true,
    heading: 'Privacy & Consent:',
  },
}; 