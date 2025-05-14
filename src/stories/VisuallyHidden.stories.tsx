import type { Meta, StoryObj } from '@storybook/react';
import { visuallyHidden as VisuallyHidden } from '@/components/ui/visually-hidden';
import type { ComponentType, ReactNode } from 'react';

// Infer the prop types from the VisuallyHidden component if possible
// If not, define a minimal interface for the storybook controls
interface VisuallyHiddenProps {
  children: ReactNode;
}

const meta: Meta<VisuallyHiddenProps> = {
  title: 'Accessibility/VisuallyHidden',
  component: VisuallyHidden as unknown as ComponentType<VisuallyHiddenProps>,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A component that hides content visually but keeps it accessible to screen readers and other assistive technologies.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: { type: 'text' },
      description: 'Content that will be hidden visually but accessible to screen readers',
    },
  },
};

export default meta;
type Story = StoryObj<VisuallyHiddenProps>;

export const Default: Story = {
  args: {
    children: 'This text is only visible to screen readers',
  },
  parameters: {
    docs: {
      description: {
        story:
          'The text inside this component is not visible on screen but will be read by screen readers. Use this to provide additional context for screen reader users without affecting the visual design.',
      },
    },
  },
};

export const WithVisibleLabel: Story = {
  render: (args) => (
    <div className="space-y-4">
      <p>
        This example shows how to use VisuallyHidden alongside visible content. The text below has
        an additional description for screen readers.
      </p>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Save changes
        {/* @ts-expect-error VisuallyHidden expects specific props; this is safe for Storybook usage */}
        <VisuallyHidden>{args.children}</VisuallyHidden>
      </button>
      <p className="text-sm text-gray-500">
        Try using a screen reader to hear the complete button text.
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Use VisuallyHidden to provide more detailed descriptions for concise UI elements. This is particularly useful for buttons and links that might be clear in visual context but need more explanation for screen reader users.',
      },
    },
  },
  args: {
    children: ' to your profile settings',
  },
};

export const FormLabels: Story = {
  render: (args) => (
    <div className="space-y-4">
      <p>
        This form uses visually hidden labels for a cleaner design, while maintaining accessibility.
      </p>
      <form className="space-y-4">
        <div className="relative">
          {/* @ts-expect-error VisuallyHidden expects specific props; this is safe for Storybook usage */}
          <VisuallyHidden>
            <label htmlFor="email">Email address</label>
          </VisuallyHidden>
          <input
            id="email"
            type="email"
            placeholder="Email address"
            className="w-full border border-gray-300 rounded-md px-4 py-2"
          />
        </div>
        <div className="relative">
          {/* @ts-expect-error VisuallyHidden expects specific props; this is safe for Storybook usage */}
          <VisuallyHidden>
            <label htmlFor="password">Password</label>
          </VisuallyHidden>
          <input
            id="password"
            type="password"
            placeholder="Password"
            className="w-full border border-gray-300 rounded-md px-4 py-2"
          />
        </div>
        <button
          type="button"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Submit
        </button>
      </form>
      <p className="text-sm text-gray-500">
        Screen readers will announce the proper labels for each field even though they are not
        visible in the design.
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'A common use case for VisuallyHidden is form labels. This allows you to create cleaner form designs while ensuring screen reader users still get proper field labels.',
      },
    },
  },
  args: {},
};

export const SkipLink: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="relative">
        <a
          href="#main-content"
          className="absolute left-0 p-2 bg-blue-500 text-white -translate-y-full focus:translate-y-0 transition-transform"
        >
          Skip to main content
        </a>
        <p>
          The skip link above is visually hidden until it receives focus. Try pressing Tab to see it
          appear.
        </p>
      </div>
      <div className="border border-gray-300 p-4 rounded" id="main-content">
        <h2 className="text-lg font-semibold">Main Content</h2>
        <p>
          Skip links allow keyboard users to bypass navigation menus and other repetitive elements.
          They are an important accessibility feature for keyboard-only users.
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Skip links allow keyboard users to bypass navigation and jump straight to the main content. This example shows how to create a skip link that is hidden until it receives focus.',
      },
    },
  },
  args: {},
};
