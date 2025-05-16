/**
 * FloatingBubble Stories
 *
 * Showcases the FloatingBubble component for creating decorative background elements.
 */

// ============================================================================
// IMPORTS
// ============================================================================

import type { Meta, StoryObj } from '@storybook/react';
import { FloatingBubble } from './FloatingBubble';

// ============================================================================
// STORYBOOK METADATA
// ============================================================================

/**
 * ## FloatingBubble Component
 * 
 * A decorative circle element for creating visual interest in backgrounds.
 * 
 * ### Usage Guidelines
 * - Use to add visual interest to empty spaces
 * - Combine multiple bubbles with different sizes and colors
 * - Keep opacity low to avoid distracting from main content
 * - Place behind content with z-index
 */
const meta: Meta<typeof FloatingBubble> = {
  title: 'Atoms/FloatingBubble',
  component: FloatingBubble,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    componentSubtitle: 'Decorative background element',
    docs: {
      description: {
        component: 'A simple decorative circle element for adding visual interest to backgrounds.'
      }
    }
  },
  args: {
    id: 1,
    size: 80,
    color: 'rgba(59, 130, 246, 0.3)',
    position: { top: '50%', left: '50%' },
  },
  argTypes: {
    id: {
      description: 'Unique identifier for the bubble',
      control: 'number',
      table: {
        type: { summary: 'number' },
      }
    },
    size: {
      description: 'Size of the bubble in pixels',
      control: { type: 'range', min: 20, max: 200, step: 5 },
      table: {
        type: { summary: 'number' },
      }
    },
    color: {
      description: 'Background color of the bubble',
      control: 'color',
      table: {
        type: { summary: 'string' },
      }
    },
    position: {
      description: 'Position coordinates for the bubble',
      control: 'object',
      table: {
        type: { summary: '{ top: string, left: string }' },
      }
    },
  },
};

export default meta;
type Story = StoryObj<typeof FloatingBubble>;

// ============================================================================
// STORIES
// ============================================================================

/**
 * Default bubble centered in the container
 */
export const Default: Story = {};

/**
 * A larger bubble with different color
 */
export const Large: Story = {
  args: {
    size: 150,
    color: 'rgba(236, 72, 153, 0.3)',
  },
};

/**
 * Multiple bubbles with different sizes and colors
 */
export const MultipleBubbles: Story = {
  render: () => (
    <div style={{ position: 'relative', width: '400px', height: '400px', backgroundColor: 'white' }}>
      <FloatingBubble 
        id={1}
        size={100}
        color="rgba(59, 130, 246, 0.3)"
        position={{ top: '20%', left: '30%' }}
      />
      <FloatingBubble 
        id={2}
        size={70}
        color="rgba(236, 72, 153, 0.2)"
        position={{ top: '60%', left: '70%' }}
      />
      <FloatingBubble 
        id={3}
        size={40}
        color="rgba(16, 185, 129, 0.4)"
        position={{ top: '40%', left: '80%' }}
      />
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        zIndex: 1,
        padding: '1rem',
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}>
        Content on top of bubbles
      </div>
    </div>
  ),
}; 