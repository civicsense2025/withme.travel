import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'Core UI/Inputs/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Button component with multiple variants, sizes, and states. Supports loading states, icons, and full-width options.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'accent'],
      description: 'Button visual style variant',
      table: {
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
      table: {
        defaultValue: { summary: 'md' },
      },
    },
    width: {
      control: 'radio',
      options: ['auto', 'full'],
      description: 'Button width (auto or full-width)',
      table: {
        defaultValue: { summary: 'auto' },
      },
    },
    loading: {
      control: 'boolean',
      description: 'Whether the button is in loading state',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    loadingText: {
      control: 'text',
      description: 'Text to display during loading state',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    children: {
      control: 'text',
      description: 'Button content/label',
    },
    leftIcon: {
      description: 'Icon to display before the button text',
    },
    rightIcon: {
      description: 'Icon to display after the button text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
    loadingText: 'loading',
  },
  parameters: {
    docs: {
      description: {
        story: 'The primary button style, used for main actions and CTAs.',
      },
    },
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
  parameters: {
    docs: {
      description: {
        story: 'Secondary button style, used for supplementary actions.',
      },
    },
  },
};

export const Accent: Story = {
  args: {
    variant: 'accent',
    children: 'Accent Button',
  },
  parameters: {
    docs: {
      description: {
        story: 'Accent button style for highlighted actions or special emphasis.',
      },
    },
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
  parameters: {
    docs: {
      description: {
        story: 'Outline button style with a border but transparent background.',
      },
    },
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
  parameters: {
    docs: {
      description: {
        story: 'Ghost button style with no background or border, useful for subtle actions.',
      },
    },
  },
};

export const ButtonSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Button size="sm">Small Button</Button>
      <Button size="md">Medium Button</Button>
      <Button size="lg">Large Button</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Buttons are available in three sizes: small, medium (default), and large.',
      },
    },
  },
};

export const FullWidth: Story = {
  args: {
    width: 'full',
    children: 'Full Width Button',
  },
  parameters: {
    docs: {
      description: {
        story: 'Button that spans the full width of its container.',
      },
    },
  },
};

export const WithIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Button leftIcon={<span>👈</span>}>Left Icon</Button>
      <Button rightIcon={<span>👉</span>}>Right Icon</Button>
      <Button leftIcon={<span>⭐</span>} rightIcon={<span>⭐</span>}>
        Both Icons
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Buttons can include icons before and/or after the text.',
      },
    },
  },
};

export const LoadingState: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Button loading>Loading Button</Button>
      <Button loading loadingText="Submitting...">
        Submit
      </Button>
      <Button variant="outline" loading loadingText="Processing...">
        Process
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Buttons can show a loading spinner along with optional loading text.',
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled state applied to buttons that are not interactive.',
      },
    },
  },
};

export const DarkMode: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        background: '#222',
        padding: '2rem',
        borderRadius: '8px',
      }}
    >
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="accent">Accent</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Buttons adapt to dark mode with appropriate color adjustments.',
      },
    },
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h3 style={{ marginBottom: '1rem' }}>Standard Variants</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="accent">Accent</Button>
        </div>
      </div>

      <div>
        <h3 style={{ marginBottom: '1rem' }}>Sizes</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </div>

      <div>
        <h3 style={{ marginBottom: '1rem' }}>States</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
          <Button loading loadingText="Saving...">
            Save
          </Button>
        </div>
      </div>

      <div>
        <h3 style={{ marginBottom: '1rem' }}>Width Options</h3>
        <Button width="full">Full Width Button</Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Overview of all button variants, sizes, and states.',
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
