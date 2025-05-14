import type { Meta, StoryObj } from '@storybook/react';
import { Alert, AlertTitle, AlertDescription } from './alert';
import { Info, AlertCircle, Check, BellRing, Clock, Ban } from 'lucide-react';

const meta: Meta<typeof Alert> = {
  title: 'Core UI/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Alert component for showing important messages, notifications, and feedback to users. Uses appropriate ARIA roles and live regions for accessibility.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'destructive',
        'travel-purple',
        'travel-blue',
        'travel-pink',
        'travel-yellow',
        'travel-mint',
        'travel-peach',
        'success',
        'warning',
        'info',
        'error',
      ],
      description: 'Visual style and importance level of the alert',
      table: {
        defaultValue: { summary: 'default' },
      },
    },
    isImportant: {
      control: 'boolean',
      description: 'Whether the alert should be announced assertively by screen readers',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  render: () => (
    <Alert className="w-96">
      <AlertTitle>Booking confirmed</AlertTitle>
      <AlertDescription>
        Your trip to Paris has been confirmed. Check your email for details.
      </AlertDescription>
    </Alert>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Default alert with title and description.',
      },
    },
  },
};

export const WithIcon: Story = {
  render: () => (
    <Alert className="w-96">
      <Check className="h-4 w-4" />
      <AlertTitle>Payment successful</AlertTitle>
      <AlertDescription>Your payment of $2,499 has been processed successfully.</AlertDescription>
    </Alert>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Alert with an icon for visual emphasis. The component has built-in spacing and positioning for icons.',
      },
    },
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Alert variant="default" className="w-96">
        <Info className="h-4 w-4" />
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>Your booking is being processed.</AlertDescription>
      </Alert>

      <Alert variant="success" className="w-96">
        <Check className="h-4 w-4" />
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>Your booking has been confirmed!</AlertDescription>
      </Alert>

      <Alert variant="warning" className="w-96">
        <Clock className="h-4 w-4" />
        <AlertTitle>Limited availability</AlertTitle>
        <AlertDescription>Only 2 spots remaining for this tour date.</AlertDescription>
      </Alert>

      <Alert variant="error" className="w-96">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Payment error</AlertTitle>
        <AlertDescription>Unable to process your payment. Please try again.</AlertDescription>
      </Alert>

      <Alert variant="destructive" className="w-96">
        <Ban className="h-4 w-4" />
        <AlertTitle>Canceled</AlertTitle>
        <AlertDescription>Your tour has been canceled due to weather conditions.</AlertDescription>
      </Alert>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Alert variants for different types of messages: informational, success, warning, error, and destructive.',
      },
    },
  },
};

export const BrandColors: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Alert variant="travel-purple" className="w-96">
        <BellRing className="h-4 w-4" />
        <AlertTitle>Travel update</AlertTitle>
        <AlertDescription>New direct flights to Tokyo now available.</AlertDescription>
      </Alert>

      <Alert variant="travel-blue" className="w-96">
        <Info className="h-4 w-4" />
        <AlertTitle>Travel tip</AlertTitle>
        <AlertDescription>Check the local weather before packing for your trip.</AlertDescription>
      </Alert>

      <Alert variant="travel-pink" className="w-96">
        <BellRing className="h-4 w-4" />
        <AlertTitle>Special offer</AlertTitle>
        <AlertDescription>Book now and get a complimentary airport transfer.</AlertDescription>
      </Alert>

      <Alert variant="travel-yellow" className="w-96">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Travel advisory</AlertTitle>
        <AlertDescription>Check current entry requirements for your destination.</AlertDescription>
      </Alert>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Alert variants using brand colors from the design system.',
      },
    },
  },
};

export const ImportantAlert: Story = {
  render: () => (
    <Alert
      variant="error"
      isImportant={true}
      className="w-96"
      titleId="passport-alert-title"
      descriptionId="passport-alert-desc"
    >
      <AlertCircle className="h-4 w-4" />
      <AlertTitle id="passport-alert-title">Passport required</AlertTitle>
      <AlertDescription id="passport-alert-desc">
        Your passport must be valid for at least 6 months beyond your return date. Please check your
        passport expiration date before booking.
      </AlertDescription>
    </Alert>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Important alert that will be announced assertively by screen readers, with explicit IDs for better accessibility.',
      },
    },
  },
};

export const InContext: Story = {
  render: () => (
    <div className="w-full max-w-3xl mx-auto p-6 border rounded-lg">
      <h2 className="text-2xl font-semibold mb-6">Trip to Bali, Indonesia</h2>

      <Alert variant="warning" className="mb-6">
        <Clock className="h-4 w-4" />
        <AlertTitle>Price increase coming soon</AlertTitle>
        <AlertDescription>
          Prices for this package will increase on June 1st. Book now to secure current pricing.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Departure</h3>
          <p>September 15, 2023</p>
          <p className="text-sm text-muted-foreground">San Francisco (SFO)</p>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-2">Return</h3>
          <p>September 28, 2023</p>
          <p className="text-sm text-muted-foreground">Denpasar (DPS)</p>
        </div>
      </div>

      <Alert variant="info" className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Visa requirements</AlertTitle>
        <AlertDescription>
          U.S. citizens can enter Indonesia visa-free for stays up to 30 days. Your passport must be
          valid for at least 6 months beyond your planned departure date.
        </AlertDescription>
      </Alert>

      <div className="flex justify-end">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md">Continue to booking</button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Alerts used in the context of a travel booking page to provide important information to users.',
      },
    },
  },
};

export const Light = {
  parameters: { backgrounds: { default: 'light' } },
};

export const Dark = {
  parameters: { backgrounds: { default: 'dark' } },
};
