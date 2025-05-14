import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';
import { Label } from './label';
import { Search, Mail, Lock, Calendar, User } from 'lucide-react';

const meta: Meta<typeof Input> = {
  title: 'Core UI/Inputs/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Input component with various styles, states, and variants for collecting user information.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
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
      description: 'Input visual style variant',
      table: {
        defaultValue: { summary: 'default' },
      },
    },
    radius: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full', 'none'],
      description: 'Border radius of the input',
      table: {
        defaultValue: { summary: 'md' },
      },
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'date', 'search', 'tel', 'url'],
      description: 'Input type',
      table: {
        defaultValue: { summary: 'text' },
      },
    },
    hasError: {
      control: 'boolean',
      description: 'Whether the input is in error state',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    required: {
      control: 'boolean',
      description: 'Whether the input is required',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
    type: 'text',
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <div>
        <Label htmlFor="default">Default</Label>
        <Input id="default" variant="default" placeholder="Default style" />
      </div>

      <div>
        <Label htmlFor="travel-purple">Travel Purple</Label>
        <Input id="travel-purple" variant="travel-purple" placeholder="Travel Purple style" />
      </div>

      <div>
        <Label htmlFor="travel-blue">Travel Blue</Label>
        <Input id="travel-blue" variant="travel-blue" placeholder="Travel Blue style" />
      </div>

      <div>
        <Label htmlFor="travel-pink">Travel Pink</Label>
        <Input id="travel-pink" variant="travel-pink" placeholder="Travel Pink style" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Input variants with different border and focus colors.',
      },
    },
  },
};

export const InputTypes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <div>
        <Label htmlFor="text-input">Text</Label>
        <Input id="text-input" type="text" placeholder="Text input" />
      </div>

      <div>
        <Label htmlFor="email-input">Email</Label>
        <Input id="email-input" type="email" placeholder="Email input" />
      </div>

      <div>
        <Label htmlFor="password-input">Password</Label>
        <Input id="password-input" type="password" placeholder="Password input" />
      </div>

      <div>
        <Label htmlFor="number-input">Number</Label>
        <Input id="number-input" type="number" placeholder="Number input" />
      </div>

      <div>
        <Label htmlFor="date-input">Date</Label>
        <Input id="date-input" type="date" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different input types for various data collection needs.',
      },
    },
  },
};

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <div>
        <Label htmlFor="default-state">Default</Label>
        <Input id="default-state" placeholder="Default state" />
      </div>

      <div>
        <Label htmlFor="disabled-state">Disabled</Label>
        <Input id="disabled-state" placeholder="Disabled state" disabled />
      </div>

      <div>
        <Label htmlFor="error-state">Error</Label>
        <Input
          id="error-state"
          placeholder="Error state"
          hasError
          aria-describedby="error-message"
        />
        <p id="error-message" className="text-sm text-red-500 mt-1">
          This field has an error
        </p>
      </div>

      <div>
        <Label htmlFor="required-state">Required</Label>
        <Input id="required-state" placeholder="Required field" required />
      </div>

      <div>
        <Label htmlFor="readonly-state">Read Only</Label>
        <Input id="readonly-state" defaultValue="Read-only content" readOnly />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Input in various states: default, disabled, error, required, and read-only.',
      },
    },
  },
};

export const BorderRadius: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <Input radius="none" placeholder="No radius" />
      <Input radius="sm" placeholder="Small radius" />
      <Input radius="md" placeholder="Medium radius (default)" />
      <Input radius="lg" placeholder="Large radius" />
      <Input radius="xl" placeholder="Extra large radius" />
      <Input radius="full" placeholder="Full radius" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Inputs with different border radius options.',
      },
    },
  },
};

export const WithIconsAdornments: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search..." />
      </div>

      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" type="email" placeholder="Email address" />
      </div>

      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" type="password" placeholder="Password" />
      </div>

      <div className="relative">
        <Input placeholder="Username" />
        <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      <div className="relative">
        <Input type="date" />
        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Inputs with icons as adornments to provide visual cues about input type.',
      },
    },
  },
};

export const AccessibleInputs: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-80">
      <div>
        <Label htmlFor="username" id="username-label">
          Username
        </Label>
        <Input
          id="username"
          placeholder="Enter username"
          aria-labelledby="username-label"
          helperTextId="username-help"
          required
        />
        <p id="username-help" className="text-sm text-muted-foreground mt-1">
          Choose a unique username for your account
        </p>
      </div>

      <div>
        <Label htmlFor="email" id="email-label">
          Email address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter email"
          aria-labelledby="email-label"
          helperTextId="email-help"
          required
        />
        <p id="email-help" className="text-sm text-muted-foreground mt-1">
          We'll never share your email with anyone else
        </p>
      </div>

      <div>
        <Label htmlFor="password" id="password-label">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter password"
          aria-labelledby="password-label"
          helperTextId="password-help"
          hasError
          required
        />
        <p id="password-help" className="text-sm text-red-500 mt-1">
          Password must be at least 8 characters
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Accessible input examples with labels, helper text, and ARIA attributes.',
      },
    },
  },
};

export const FormLayout: Story = {
  render: () => (
    <form className="w-96 p-6 border rounded-lg">
      <h2 className="text-lg font-semibold mb-4">User Registration</h2>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="first-name">First Name</Label>
            <Input id="first-name" placeholder="First name" required />
          </div>

          <div>
            <Label htmlFor="last-name">Last Name</Label>
            <Input id="last-name" placeholder="Last name" required />
          </div>
        </div>

        <div>
          <Label htmlFor="email-address">Email Address</Label>
          <Input id="email-address" type="email" placeholder="Email address" required />
        </div>

        <div>
          <Label htmlFor="new-password">Password</Label>
          <Input id="new-password" type="password" placeholder="Create a password" required />
          <p className="text-xs text-muted-foreground mt-1">Must be at least 8 characters long</p>
        </div>

        <div>
          <Label htmlFor="birth-date">Date of Birth</Label>
          <Input id="birth-date" type="date" required />
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          className="w-full px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium"
        >
          Create Account
        </button>
      </div>
    </form>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example form layout using inputs in a registration form.',
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
