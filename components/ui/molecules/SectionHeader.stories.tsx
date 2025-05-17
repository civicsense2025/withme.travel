/**
 * SectionHeader Stories
 *
 * Showcases the SectionHeader component for page section headers.
 */

// ============================================================================
// IMPORTS
// ============================================================================

import type { Meta, StoryObj } from '@storybook/react';
import { SectionHeader } from './SectionHeader';

// ============================================================================
// STORYBOOK METADATA
// ============================================================================

/**
 * ## SectionHeader Component
 * 
 * A reusable header for page sections with title and subtitle.
 * 
 * ### Usage Guidelines
 * - Use at the beginning of major content sections
 * - Keep titles concise and descriptive
 * - Subtitles should provide additional context
 * - Maintain consistent spacing between headers and content
 */
const meta: Meta<typeof SectionHeader> = {
  title: 'UI/SectionHeader',
  component: SectionHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    componentSubtitle: 'Consistent header styling for page sections',
    docs: {
      description: {
        component: 'A header component for page sections with customizable title and subtitle.'
      }
    }
  },
  args: {
    title: 'Section Title',
    subtitle: 'This is a section subtitle that provides more context about the content.',
    layout: 'desktop',
  },
  argTypes: {
    title: {
      description: 'Title of the section',
      control: 'text',
    },
    subtitle: {
      description: 'Subtitle or description text',
      control: 'text',
    },
    layout: {
      description: 'Layout size for responsive design',
      control: 'radio',
      options: ['mobile', 'tablet', 'desktop'],
      table: {
        type: { summary: 'LayoutType' },
        defaultValue: { summary: 'desktop' },
      }
    },
    textColor: {
      description: 'Custom text color for the title',
      control: 'color',
    },
    mutedColor: {
      description: 'Custom muted color for the subtitle',
      control: 'color',
    },
    className: {
      description: 'Additional CSS classes',
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SectionHeader>;

// ============================================================================
// STORIES
// ============================================================================

/**
 * Default section header
 */
export const Default: Story = {};

/**
 * Mobile view of the section header
 */
export const Mobile: Story = {
  args: {
    layout: 'mobile',
  },
};

/**
 * Section header with custom colors
 */
export const CustomColors: Story = {
  args: {
    textColor: '#0EA5E9',
    mutedColor: '#64748B',
  },
};

/**
 * Section header with rich content in the title
 */
export const RichTitle: Story = {
  args: {
    title: (
      <>
        Features <span className="text-blue-500">✨</span>
      </>
    ),
  },
};

/**
 * Comparison of different layouts
 */
export const LayoutComparison: Story = {
  render: () => (
    <div className="flex flex-col gap-8 w-full max-w-2xl">
      <div className="p-4 border rounded-md">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Desktop Layout</h3>
        <SectionHeader 
          title="Desktop View" 
          subtitle="Section headers displayed on desktop screens"
          layout="desktop" 
        />
      </div>
      
      <div className="p-4 border rounded-md">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Tablet Layout</h3>
        <SectionHeader 
          title="Tablet View" 
          subtitle="Section headers displayed on tablet screens"
          layout="tablet" 
        />
      </div>
      
      <div className="p-4 border rounded-md">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Mobile Layout</h3>
        <SectionHeader 
          title="Mobile View" 
          subtitle="Section headers displayed on mobile screens"
          layout="mobile" 
        />
      </div>
    </div>
  ),
}; 