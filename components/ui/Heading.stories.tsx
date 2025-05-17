import type { Meta, StoryObj } from '@storybook/react';
import { Heading } from './Heading';
import { COLORS } from '@/utils/constants/ui/design-system';

const meta: Meta<typeof Heading> = {
  title: 'Design System/Typography/Heading',
  component: Heading,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Heading component for section titles and content hierarchy with various levels, styles, and weights.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    level: {
      control: 'select',
      options: [1, 2, 3, 4, 5, 6],
      description: 'Heading level (1-6, corresponds to h1-h6)',
      table: {
        defaultValue: { summary: '1' },
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
        defaultValue: { summary: 'bold' },
      },
    },
    mode: {
      control: 'select',
      options: ['light', 'dark'],
      description: 'Theme mode (overrides system theme)',
    },
    align: {
      control: 'select',
      options: ['left', 'center', 'right'],
      description: 'Text alignment',
      table: {
        defaultValue: { summary: 'left' },
      },
    },
    children: {
      control: 'text',
      description: 'Heading content',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Heading>;

export const HeadingLevels: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px' }}>
      <div>
        <Heading level={1}>H1: Main Page Heading</Heading>
        <p style={{ color: '#666', marginTop: '0.5rem', fontSize: '0.9rem' }}>
          Used for primary page headings. Only one h1 should exist per page.
        </p>
      </div>

      <div>
        <Heading level={2}>H2: Section Heading</Heading>
        <p style={{ color: '#666', marginTop: '0.5rem', fontSize: '0.9rem' }}>
          Used for major section headings within a page.
        </p>
      </div>

      <div>
        <Heading level={3}>H3: Subsection Heading</Heading>
        <p style={{ color: '#666', marginTop: '0.5rem', fontSize: '0.9rem' }}>
          Used for subsections and card titles.
        </p>
      </div>

      <div>
        <Heading level={4}>H4: Minor Subsection</Heading>
        <p style={{ color: '#666', marginTop: '0.5rem', fontSize: '0.9rem' }}>
          Used for smaller sections and content block titles.
        </p>
      </div>

      <div>
        <Heading level={5}>H5: Content Title</Heading>
        <p style={{ color: '#666', marginTop: '0.5rem', fontSize: '0.9rem' }}>
          Used for smaller content sections, often similar to bold body text.
        </p>
      </div>

      <div>
        <Heading level={6}>H6: Minor Title</Heading>
        <p style={{ color: '#666', marginTop: '0.5rem', fontSize: '0.9rem' }}>
          Used for fine-grained sections, captions, or labels.
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Headings come in six levels (h1-h6) with appropriate sizing, spacing and emphasis.',
      },
    },
  },
};

export const HeadingWeights: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px' }}>
      <div>
        <Heading level={2} weight="regular">
          Regular Weight
        </Heading>
        <p style={{ color: '#666', marginTop: '0.5rem', fontSize: '0.9rem' }}>
          Standard weight, less emphasis but maintains heading hierarchy.
        </p>
      </div>

      <div>
        <Heading level={2} weight="medium">
          Medium Weight
        </Heading>
        <p style={{ color: '#666', marginTop: '0.5rem', fontSize: '0.9rem' }}>
          Medium emphasis, good for most secondary headings.
        </p>
      </div>

      <div>
        <Heading level={2} weight="semibold">
          Semibold Weight
        </Heading>
        <p style={{ color: '#666', marginTop: '0.5rem', fontSize: '0.9rem' }}>
          Stronger emphasis without being too heavy.
        </p>
      </div>

      <div>
        <Heading level={2} weight="bold">
          Bold Weight
        </Heading>
        <p style={{ color: '#666', marginTop: '0.5rem', fontSize: '0.9rem' }}>
          Maximum emphasis, the default for headings.
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Headings support different font weights to control emphasis.',
      },
    },
  },
};

export const HeadingColors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
      <Heading level={2}>Default Color</Heading>
      <Heading level={2} color="PRIMARY">
        Primary Color
      </Heading>
      <Heading level={2} color="SECONDARY">
        Secondary Color
      </Heading>
      <Heading level={2} color="ACCENT">
        Accent Color
      </Heading>
      <Heading level={2} color="MUTED">
        Muted Color
      </Heading>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Headings can use different colors from the design system.',
      },
    },
  },
};

export const HeadingAlignment: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px' }}>
      <div>
        <Heading level={2} align="left">
          Left-Aligned Heading
        </Heading>
        <p style={{ color: '#666', marginTop: '0.5rem', fontSize: '0.9rem' }}>
          Default alignment, best for most content. Creates a strong left margin for easy reading.
        </p>
      </div>

      <div>
        <Heading level={2} align="center">
          Center-Aligned Heading
        </Heading>
        <p style={{ color: '#666', marginTop: '0.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
          Useful for page titles, hero sections, or symmetrical layouts.
        </p>
      </div>

      <div>
        <Heading level={2} align="right">
          Right-Aligned Heading
        </Heading>
        <p style={{ color: '#666', marginTop: '0.5rem', fontSize: '0.9rem', textAlign: 'right' }}>
          Rarely used, but can be effective for specific layout needs or right-to-left languages.
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Headings can be aligned left, center, or right.',
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
        <Heading level={2} mode="light">
          Light Mode Heading
        </Heading>
        <Heading level={3} color="PRIMARY" mode="light" style={{ marginTop: '1rem' }}>
          Primary Color
        </Heading>
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
        <Heading level={2} mode="dark">
          Dark Mode Heading
        </Heading>
        <Heading level={3} color="PRIMARY" mode="dark" style={{ marginTop: '1rem' }}>
          Primary Color
        </Heading>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Headings support light and dark mode with appropriate color adjustments.',
      },
    },
  },
};

export const PageHierarchyExample: Story = {
  render: () => (
    <div
      style={{ maxWidth: '800px', padding: '2rem', border: '1px solid #eee', borderRadius: '8px' }}
    >
      <Heading level={1}>Travel Guide: Tokyo, Japan</Heading>

      <div style={{ marginTop: '2rem' }}>
        <Heading level={2}>Getting Around</Heading>
        <p style={{ margin: '1rem 0' }}>
          Tokyo has one of the world's best public transportation systems. The metro and JR lines
          can take you anywhere in the city.
        </p>

        <div style={{ marginTop: '1.5rem' }}>
          <Heading level={3}>Tokyo Metro</Heading>
          <p style={{ margin: '0.75rem 0' }}>
            The Tokyo Metro is the primary subway system with 9 lines covering most tourist
            destinations.
          </p>

          <div style={{ marginTop: '1rem' }}>
            <Heading level={4}>Ticket Options</Heading>
            <p style={{ margin: '0.5rem 0' }}>
              Tickets start at 170 yen for the shortest trips. Consider a 24-hour, 48-hour, or
              72-hour unlimited pass.
            </p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <Heading level={2}>Popular Attractions</Heading>
        <p style={{ margin: '1rem 0' }}>
          From historic temples to modern shopping districts, Tokyo offers countless experiences.
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Example showing how different heading levels work together to create content hierarchy.',
      },
    },
  },
};
