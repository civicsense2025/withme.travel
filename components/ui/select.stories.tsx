import type { Meta, StoryObj } from '@storybook/react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
} from './select';
import { Label } from './label';

const meta: Meta<typeof Select> = {
  title: 'Core UI/Select',
  component: Select,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Select component for choosing a value from a list of options. Built on Radix UI Select primitive for accessibility.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    defaultValue: {
      control: 'text',
      description: 'Default selected value',
    },
    value: {
      control: 'text',
      description: 'Controlled selected value',
    },
    onValueChange: {
      action: 'valueChanged',
      description: 'Callback when selection changes',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the select is disabled',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    required: {
      control: 'boolean',
      description: 'Whether the select is required',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: () => (
    <div className="w-80">
      <Label htmlFor="default-select" className="mb-2 block">
        Choose an option
      </Label>
      <Select defaultValue="option1">
        <SelectTrigger id="default-select">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
          <SelectItem value="option3">Option 3</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Default select component with a label and three options.',
      },
    },
  },
};

export const WithGroups: Story = {
  render: () => (
    <div className="w-80">
      <Label htmlFor="grouped-select" className="mb-2 block">
        Travel destination
      </Label>
      <Select>
        <SelectTrigger id="grouped-select">
          <SelectValue placeholder="Select a destination" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Europe</SelectLabel>
            <SelectItem value="paris">Paris, France</SelectItem>
            <SelectItem value="rome">Rome, Italy</SelectItem>
            <SelectItem value="barcelona">Barcelona, Spain</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Asia</SelectLabel>
            <SelectItem value="tokyo">Tokyo, Japan</SelectItem>
            <SelectItem value="bangkok">Bangkok, Thailand</SelectItem>
            <SelectItem value="singapore">Singapore</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Americas</SelectLabel>
            <SelectItem value="newyork">New York, USA</SelectItem>
            <SelectItem value="rio">Rio de Janeiro, Brazil</SelectItem>
            <SelectItem value="cancun">Cancun, Mexico</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Select with grouped options for better organization of related items.',
      },
    },
  },
};

export const WithPlaceholder: Story = {
  render: () => (
    <div className="w-80">
      <Label htmlFor="placeholder-select" className="mb-2 block">
        Language
      </Label>
      <Select>
        <SelectTrigger id="placeholder-select">
          <SelectValue placeholder="Select a language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="english">English</SelectItem>
          <SelectItem value="spanish">Spanish</SelectItem>
          <SelectItem value="french">French</SelectItem>
          <SelectItem value="german">German</SelectItem>
          <SelectItem value="japanese">Japanese</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Select with a placeholder to guide the user on what to select.',
      },
    },
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div>
        <Label htmlFor="disabled-select" className="mb-2 block">
          Unavailable options
        </Label>
        <Select disabled>
          <SelectTrigger id="disabled-select">
            <SelectValue placeholder="Cannot select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="disabled-items" className="mb-2 block">
          Partially available
        </Label>
        <Select>
          <SelectTrigger id="disabled-items">
            <SelectValue placeholder="Some options disabled" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Available option</SelectItem>
            <SelectItem value="option2" disabled>
              Unavailable option
            </SelectItem>
            <SelectItem value="option3">Available option</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Examples of disabled select controls and individual disabled options.',
      },
    },
  },
};

export const WithCustomWidth: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="narrow-select" className="mb-2 block">
          Narrow
        </Label>
        <Select>
          <SelectTrigger id="narrow-select" className="w-40">
            <SelectValue placeholder="Narrow width" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="medium-select" className="mb-2 block">
          Medium
        </Label>
        <Select>
          <SelectTrigger id="medium-select" className="w-60">
            <SelectValue placeholder="Medium width" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="wide-select" className="mb-2 block">
          Wide
        </Label>
        <Select>
          <SelectTrigger id="wide-select" className="w-80">
            <SelectValue placeholder="Wide width" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Select components with different widths using custom classes.',
      },
    },
  },
};

export const FormExample: Story = {
  render: () => (
    <form className="w-96 p-6 border rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Trip Preferences</h2>

      <div className="space-y-4">
        <div>
          <Label htmlFor="trip-type" className="block mb-2">
            Trip Type
          </Label>
          <Select defaultValue="leisure">
            <SelectTrigger id="trip-type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="leisure">Leisure</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="family">Family</SelectItem>
              <SelectItem value="adventure">Adventure</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="destination" className="block mb-2">
            Destination
          </Label>
          <Select>
            <SelectTrigger id="destination" className="w-full">
              <SelectValue placeholder="Select a destination" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Popular Destinations</SelectLabel>
                <SelectItem value="paris">Paris, France</SelectItem>
                <SelectItem value="tokyo">Tokyo, Japan</SelectItem>
                <SelectItem value="newyork">New York, USA</SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Beach Destinations</SelectLabel>
                <SelectItem value="bali">Bali, Indonesia</SelectItem>
                <SelectItem value="cancun">Cancun, Mexico</SelectItem>
                <SelectItem value="maldives">Maldives</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="duration" className="block mb-2">
            Duration
          </Label>
          <Select>
            <SelectTrigger id="duration" className="w-full">
              <SelectValue placeholder="Select trip duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekend">Weekend (2-3 days)</SelectItem>
              <SelectItem value="week">Week (5-7 days)</SelectItem>
              <SelectItem value="twoweeks">Two weeks</SelectItem>
              <SelectItem value="month">Month or longer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          className="w-full px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium"
        >
          Save Preferences
        </button>
      </div>
    </form>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Select components used in a form context for trip preferences.',
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
