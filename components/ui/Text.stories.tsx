import type { Meta, StoryObj } from '@storybook/react';
import { Text } from './Text';
import { COLORS } from '@/utils/constants/design-system';

const meta: Meta<typeof Text> = {
  title: 'Design System/Typography/Text',
  component: Text,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Typography component for rendering text with various styles, sizes, weights, and colors.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['large', 'body', 'small', 'caption', 'label'],
      description: 'Typography variant controlling size and spacing',
      table: {
        defaultValue: { summary: 'body' },
      },
    },
    color: {
      control: 'select',
      options: Object.keys(COLORS.light).filter(
        (key) => typeof COLORS.light[key as keyof typeof COLORS.light] === 'string'
      ),
      description: 'Color token from the design system',
      table: {
        defaultValue: { summary: 'TEXT' },
      },
    },
    weight: {
      control: 'select',
      options: ['regular', 'medium', 'semibold', 'bold'],
      description: 'Font weight',
      table: {
        defaultValue: { summary: 'regular' },
      },
    },
    mode: {
      control: 'select',
      options: ['light', 'dark'],
      description: 'Theme mode (overrides system theme)',
    },
    children: {
      control: 'text',
      description: 'Text content',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Text>;

export const Default: Story = {
  args: {
    children: 'This is standard body text in the default style',
  },
  parameters: {
    docs: {
      description: {
        story: 'Default body text using the standard font size and weight.',
      },
    },
  },
};

export const TextVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px' }}>
      <div>
        <Text variant="large">Large Text</Text>
        <Text variant="large" color="MUTED" style={{ marginTop: '0.25rem' }}>
          Used for emphasized text portions that need to stand out.
        </Text>
      </div>

      <div>
        <Text variant="body">Body Text</Text>
        <Text variant="small" color="MUTED" style={{ marginTop: '0.25rem' }}>
          Standard text size for paragraphs and most content. This is the default variant.
        </Text>
      </div>

      <div>
        <Text variant="small">Small Text</Text>
        <Text variant="small" color="MUTED" style={{ marginTop: '0.25rem' }}>
          Used for secondary information that should be less prominent.
        </Text>
      </div>

      <div>
        <Text variant="caption">Caption Text</Text>
        <Text variant="small" color="MUTED" style={{ marginTop: '0.25rem' }}>
          Used for captions, footnotes, or supplementary information.
        </Text>
      </div>

      <div>
        <Text variant="label">Label Text</Text>
        <Text variant="small" color="MUTED" style={{ marginTop: '0.25rem' }}>
          Used for form labels and other identifying elements.
        </Text>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Text comes in five variants: large, body, small, caption, and label.',
      },
    },
  },
};

export const TextWeights: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px' }}>
      <div>
        <Text weight="regular">Regular Weight (400)</Text>
        <Text variant="small" color="MUTED" style={{ marginTop: '0.25rem' }}>
          Standard weight for most text content.
        </Text>
      </div>

      <div>
        <Text weight="medium">Medium Weight (500)</Text>
        <Text variant="small" color="MUTED" style={{ marginTop: '0.25rem' }}>
          Slightly emphasized weight for semi-strong content.
        </Text>
      </div>

      <div>
        <Text weight="semibold">Semibold Weight (600)</Text>
        <Text variant="small" color="MUTED" style={{ marginTop: '0.25rem' }}>
          Stronger emphasis without going to full bold.
        </Text>
      </div>

      <div>
        <Text weight="bold">Bold Weight (700)</Text>
        <Text variant="small" color="MUTED" style={{ marginTop: '0.25rem' }}>
          Maximum emphasis for important content.
        </Text>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Text supports four different weights: regular, medium, semibold, and bold.',
      },
    },
  },
};

export const TextColors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
      <Text>Default Text Color</Text>
      <Text color="PRIMARY">Primary Color</Text>
      <Text color="SECONDARY">Secondary Color</Text>
      <Text color="ACCENT">Accent Color</Text>
      <Text color="MUTED">Muted Color</Text>
      <Text color="INFO">Info Color</Text>
      <Text color="SUCCESS">Success Color</Text>
      <Text color="WARNING">Warning Color</Text>
      <Text color="ERROR">Error Color</Text>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Text can use various colors from the design system.',
      },
    },
  },
};

export const ThemeModes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', maxWidth: '800px' }}>
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: '1rem' }}>
          <strong>Light Mode</strong>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Text mode="light">Default Text</Text>
          <Text mode="light" color="PRIMARY">
            Primary Color
          </Text>
          <Text mode="light" color="SECONDARY">
            Secondary Color
          </Text>
          <Text mode="light" color="MUTED">
            Muted Color
          </Text>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          background: '#222',
          padding: '1rem',
          borderRadius: '8px',
        }}
      >
        <div style={{ marginBottom: '1rem', color: 'white' }}>
          <strong>Dark Mode</strong>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Text mode="dark">Default Text</Text>
          <Text mode="dark" color="PRIMARY">
            Primary Color
          </Text>
          <Text mode="dark" color="SECONDARY">
            Secondary Color
          </Text>
          <Text mode="dark" color="MUTED">
            Muted Color
          </Text>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Text supports light and dark mode with appropriate color adjustments.',
      },
    },
  },
};

export const CombinedStyles: Story = {
  render: () => (
    <div style={{ maxWidth: '600px' }}>
      <Text variant="large" weight="bold" color="PRIMARY">
        Combining Styles
      </Text>
      <Text variant="body" style={{ marginTop: '1rem' }}>
        You can combine different text properties to create the exact style you need. This example
        uses large variant with bold weight and primary color.
      </Text>
      <Text variant="small" color="MUTED" style={{ marginTop: '1rem' }}>
        Combine variant, weight, and color properties to create custom text styles while maintaining
        consistency with the design system.
      </Text>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Text properties can be combined to create custom styles while maintaining design system consistency.',
      },
    },
  },
};
