import type { Meta, StoryObj } from '@storybook/react';
import { Confetti } from './Confetti';

const meta: Meta<typeof Confetti> = {
  title: 'Features/UserTesting/Atoms/Confetti',
  component: Confetti,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    width: {
      control: { type: 'number' },
      description: 'Width of the confetti area in pixels'
    },
    height: {
      control: { type: 'number' },
      description: 'Height of the confetti area in pixels'
    },
    numberOfPieces: {
      control: { type: 'range', min: 10, max: 500, step: 10 },
      description: 'Number of confetti pieces to display'
    },
    recycle: {
      control: 'boolean',
      description: 'Whether to recycle confetti pieces when they reach the bottom'
    },
    colors: {
      control: 'object',
      description: 'Array of colors for the confetti pieces'
    },
    gravity: {
      control: { type: 'range', min: 0.01, max: 1, step: 0.01 },
      description: 'Gravity factor (falling speed)'
    },
    wind: {
      control: { type: 'range', min: -0.5, max: 0.5, step: 0.01 },
      description: 'Wind factor (horizontal movement)'
    },
    opacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      description: 'Opacity of confetti pieces'
    },
    run: {
      control: 'boolean',
      description: 'Whether the animation should run'
    }
  }
};

export default meta;
type Story = StoryObj<typeof Confetti>;

export const Default: Story = {
  args: {
    width: 800,
    height: 400,
    numberOfPieces: 100,
    recycle: true,
    gravity: 0.1,
    wind: 0,
    opacity: 0.9,
    run: true
  },
  render: (args) => (
    <div style={{ position: 'relative', width: '100%', height: '400px', overflow: 'hidden' }}>
      <Confetti {...args} />
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
        background: 'rgba(255,255,255,0.8)',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: 0 }}>🎉 Celebration Time! 🎉</h2>
        <p>Use this component for milestone celebrations and achievements.</p>
      </div>
    </div>
  )
};

export const Explosion: Story = {
  args: {
    numberOfPieces: 200,
    recycle: false,
    gravity: 0.2,
    wind: 0,
    opacity: 1
  }
};

export const Subtle: Story = {
  args: {
    numberOfPieces: 50,
    recycle: true,
    gravity: 0.05,
    wind: 0.1,
    opacity: 0.7
  }
}; 