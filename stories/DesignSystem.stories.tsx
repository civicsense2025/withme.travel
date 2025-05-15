import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

// Design System component
const DesignSystem = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">WithMe.travel Design System</h1>
      
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Brand Colors</h2>
        <div className="flex flex-wrap">
          <div className="color-sample color-travel-purple" data-color-name="Purple"></div>
          <div className="color-sample color-travel-blue" data-color-name="Blue"></div>
          <div className="color-sample color-travel-pink" data-color-name="Pink"></div>
          <div className="color-sample color-travel-yellow" data-color-name="Yellow"></div>
          <div className="color-sample color-travel-mint" data-color-name="Mint"></div>
          <div className="color-sample color-travel-peach" data-color-name="Peach"></div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Typography</h2>
        <div className="space-y-4">
          <div>
            <h1>Heading 1</h1>
            <p className="text-sm text-gray-500">--font-size-h1</p>
          </div>
          <div>
            <h2>Heading 2</h2>
            <p className="text-sm text-gray-500">--font-size-h2</p>
          </div>
          <div>
            <h3>Heading 3</h3>
            <p className="text-sm text-gray-500">--font-size-h3</p>
          </div>
          <div>
            <p>This is body text. The quick brown fox jumps over the lazy dog.</p>
            <p className="text-sm text-gray-500">--font-size-base</p>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Buttons</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <button className="btn-primary">Primary Button</button>
            <button className="btn-secondary">Secondary Button</button>
            <button className="btn-accent">Accent Button</button>
            <button className="btn-disabled">Disabled Button</button>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="text-xl font-semibold mb-2">Card Title</h3>
            <p>This is a standard card with some sample content.</p>
          </div>
          <div className="card">
            <h3 className="text-xl font-semibold mb-2">Interactive Card</h3>
            <p>Cards can contain interactive elements.</p>
            <button className="btn-primary mt-4">Action</button>
          </div>
        </div>
      </section>
    </div>
  );
};

// Define meta with satisfies for better TypeScript inference
const meta = {
  title: 'Design System/Overview',
  component: DesignSystem,
  parameters: {
    layout: 'fullscreen',
  }
} satisfies Meta<typeof DesignSystem>;

export default meta;
type Story = StoryObj<typeof DesignSystem>;

export const Overview: Story = {}; 