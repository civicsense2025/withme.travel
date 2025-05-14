import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './checkbox';
import { Label } from './label';
import { Text } from './Text';

const meta: Meta<typeof Checkbox> = {
  title: 'Core UI/Inputs/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Checkbox component for toggling between checked and unchecked states. Built on Radix UI Checkbox primitive for accessibility.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Whether the checkbox is checked',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    defaultChecked: {
      control: 'boolean',
      description: 'Whether the checkbox is checked by default',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    onCheckedChange: {
      action: 'checkedChanged',
      description: 'Callback when checked state changes',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the checkbox is disabled',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    required: {
      control: 'boolean',
      description: 'Whether the checkbox is required',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    name: {
      control: 'text',
      description: 'Name attribute for the checkbox',
    },
    value: {
      control: 'text',
      description: 'Value attribute for the checkbox',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="default" />
      <Label htmlFor="default">Accept terms and conditions</Label>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Default checkbox with an associated label.',
      },
    },
  },
};

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="unchecked" />
        <Label htmlFor="unchecked">Unchecked (default)</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="checked" defaultChecked />
        <Label htmlFor="checked">Checked</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="disabled-unchecked" disabled />
        <Label htmlFor="disabled-unchecked" className="text-muted-foreground">
          Disabled unchecked
        </Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="disabled-checked" disabled defaultChecked />
        <Label htmlFor="disabled-checked" className="text-muted-foreground">
          Disabled checked
        </Label>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Checkbox in various states: unchecked, checked, disabled unchecked, and disabled checked.',
      },
    },
  },
};

export const WithHelperText: Story = {
  render: () => (
    <div className="w-80">
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <Checkbox id="helper-text" />
        </div>
        <div className="ml-3 text-sm">
          <Label htmlFor="helper-text">Subscribe to newsletter</Label>
          <p className="text-muted-foreground mt-1">
            Receive updates about new travel destinations and exclusive offers.
          </p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Checkbox with additional helper text for more context.',
      },
    },
  },
};

export const InAGroup: Story = {
  render: () => (
    <div className="w-80 border rounded-md p-4">
      <fieldset>
        <legend className="text-base font-medium mb-4">Travel preferences</legend>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="beach" value="beach" />
            <Label htmlFor="beach">Beach destinations</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="mountain" value="mountain" />
            <Label htmlFor="mountain">Mountain retreats</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="city" value="city" defaultChecked />
            <Label htmlFor="city">City exploration</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="countryside" value="countryside" />
            <Label htmlFor="countryside">Countryside getaways</Label>
          </div>
        </div>
      </fieldset>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Checkbox group used to select multiple options from a list.',
      },
    },
  },
};

export const WithLongWrappingText: Story = {
  render: () => (
    <div className="w-80">
      <div className="flex items-start">
        <div className="flex items-center h-5 pt-1">
          <Checkbox id="terms" />
        </div>
        <div className="ml-3">
          <Label htmlFor="terms" className="text-sm">
            I agree to the Terms of Service and Privacy Policy, and acknowledge that my information
            will be used in accordance with these policies. I understand I can unsubscribe at any
            time.
          </Label>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Checkbox with long text that wraps to multiple lines. The checkbox remains aligned with the first line of text.',
      },
    },
  },
};

export const FormExample: Story = {
  render: () => (
    <form className="w-96 p-6 border rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Trip Booking</h2>

      <div className="space-y-5">
        <h3 className="text-md font-medium">Add-on Services</h3>

        <div className="space-y-3">
          <div className="flex items-start">
            <div className="flex items-center h-5 pt-1">
              <Checkbox id="travel-insurance" />
            </div>
            <div className="ml-3">
              <Label htmlFor="travel-insurance" className="text-sm font-medium">
                Travel Insurance
              </Label>
              <p className="text-xs text-muted-foreground">
                Covers medical expenses, trip cancellation, and lost luggage
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5 pt-1">
              <Checkbox id="airport-transfer" defaultChecked />
            </div>
            <div className="ml-3">
              <Label htmlFor="airport-transfer" className="text-sm font-medium">
                Airport Transfer
              </Label>
              <p className="text-xs text-muted-foreground">Direct transfer from airport to hotel</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5 pt-1">
              <Checkbox id="guided-tour" />
            </div>
            <div className="ml-3">
              <Label htmlFor="guided-tour" className="text-sm font-medium">
                Guided City Tour
              </Label>
              <p className="text-xs text-muted-foreground">
                Professional guided tour of major attractions
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t mt-6">
          <div className="flex items-start">
            <div className="flex items-center h-5 pt-1">
              <Checkbox id="agreement" required />
            </div>
            <div className="ml-3">
              <Label htmlFor="agreement" className="text-sm">
                I agree to the booking terms and conditions
              </Label>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          className="w-full px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium"
        >
          Complete Booking
        </button>
      </div>
    </form>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Checkboxes used in a form context for trip booking add-ons and agreement terms.',
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
