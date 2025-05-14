import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const meta: Meta = {
  title: 'Design System/Overview',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj;

// Simple component to display color swatches
const ColorSwatch = ({ name, cssVar, hex }: { name: string; cssVar: string; hex: string }) => (
  <div className="mb-4">
    <div
      className="h-16 w-full rounded-md mb-2"
      style={{ backgroundColor: hex, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
    />
    <div className="text-sm font-medium">{name}</div>
    <div className="text-xs text-text-secondary">
      <span>{cssVar}</span>
      <span className="ml-2">{hex}</span>
    </div>
  </div>
);

// Component to display font styles
const TypeExample = ({
  name,
  size,
  weight,
  className,
}: {
  name: string;
  size: string;
  weight: string;
  className: string;
}) => (
  <div className="mb-8">
    <div className={`${className} mb-2`}>The quick brown fox jumps over the lazy dog</div>
    <div className="flex flex-wrap text-xs text-text-secondary gap-x-4">
      <span>{name}</span>
      <span>{size}</span>
      <span>{weight}</span>
      <span>{className}</span>
    </div>
  </div>
);

// Component to display spacing
const SpacingExample = ({ size, value }: { size: number; value: string }) => (
  <div className="flex items-center mb-4">
    <div className="w-24 text-sm">{`p-${size}, m-${size}`}</div>
    <div className="w-24 text-sm text-text-secondary">{value}</div>
    <div
      className="bg-travel-purple/20 border border-travel-purple"
      style={{ width: value, height: '24px' }}
    />
  </div>
);

export const DesignSystem: Story = {
  render: () => (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="mb-12">WithMe.Travel Design System</h1>

      <section className="mb-16">
        <h2 className="mb-6">Color System</h2>

        <h3 className="mb-4">Brand Colors</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <ColorSwatch name="Travel Purple" cssVar="--travel-purple" hex="#d4b3ff" />
          <ColorSwatch name="Travel Blue" cssVar="--travel-blue" hex="#b3d9ff" />
          <ColorSwatch name="Travel Pink" cssVar="--travel-pink" hex="#ffb3d9" />
          <ColorSwatch name="Travel Yellow" cssVar="--travel-yellow" hex="#ffe0b3" />
          <ColorSwatch name="Travel Mint" cssVar="--travel-mint" hex="#b3ffda" />
          <ColorSwatch name="Travel Peach" cssVar="--travel-peach" hex="#ffcba9" />
        </div>

        <h3 className="mb-4">Neutral Colors</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <ColorSwatch name="Background" cssVar="--background" hex="#ffffff" />
          <ColorSwatch name="Surface" cssVar="--surface" hex="#fafafa" />
          <ColorSwatch name="Text Primary" cssVar="--text-primary" hex="#0f172a" />
          <ColorSwatch name="Text Secondary" cssVar="--text-secondary" hex="#475569" />
          <ColorSwatch name="Border" cssVar="--border-base" hex="#e2e8f0" />
          <ColorSwatch name="Focus" cssVar="--focus" hex="#e0ccff" />
          <ColorSwatch name="Subtle" cssVar="--subtle" hex="#f5f7fa" />
        </div>

        <h3 className="mb-4">Category Colors</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <ColorSwatch name="Accommodation" cssVar="accommodation" hex="#9f66e6" />
          <ColorSwatch name="Food" cssVar="food" hex="#5ec489" />
          <ColorSwatch name="Transportation" cssVar="transportation" hex="#f2a742" />
          <ColorSwatch name="Activities" cssVar="activities" hex="#42bce6" />
          <ColorSwatch name="Shopping" cssVar="shopping" hex="#e66699" />
          <ColorSwatch name="Other" cssVar="other" hex="#8899aa" />
        </div>
      </section>

      <section className="mb-16">
        <h2 className="mb-6">Typography</h2>

        <h3 className="mb-4">Font Stack</h3>
        <div className="p-4 bg-subtle rounded-md mb-8 text-sm font-mono">
          <code>
            -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif
          </code>
        </div>

        <h3 className="mb-4">Type Scale</h3>
        <TypeExample
          name="Heading 1"
          size="2.5rem (40px)"
          weight="700"
          className="text-4xl font-bold"
        />
        <TypeExample
          name="Heading 2"
          size="2rem (32px)"
          weight="600"
          className="text-3xl font-semibold"
        />
        <TypeExample
          name="Heading 3"
          size="1.5rem (24px)"
          weight="600"
          className="text-2xl font-semibold"
        />
        <TypeExample name="Body" size="1rem (16px)" weight="400" className="text-base" />
        <TypeExample name="Small" size="0.875rem (14px)" weight="400" className="text-sm" />
        <TypeExample name="Caption" size="0.75rem (12px)" weight="400" className="text-xs" />
      </section>

      <section className="mb-16">
        <h2 className="mb-6">Spacing System</h2>
        <p className="mb-6">Based on a 4px grid system</p>

        <SpacingExample size={0} value="0px" />
        <SpacingExample size={1} value="4px" />
        <SpacingExample size={2} value="8px" />
        <SpacingExample size={3} value="12px" />
        <SpacingExample size={4} value="16px" />
        <SpacingExample size={5} value="20px" />
        <SpacingExample size={6} value="24px" />
        <SpacingExample size={8} value="32px" />
        <SpacingExample size={10} value="40px" />
        <SpacingExample size={12} value="48px" />
        <SpacingExample size={16} value="64px" />
      </section>

      <section className="mb-16">
        <h2 className="mb-6">Border Radius</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <div className="h-16 w-full bg-travel-purple/20 rounded-none border border-travel-purple mb-2"></div>
            <div className="text-sm">None (0px)</div>
            <div className="text-xs text-text-secondary">rounded-none</div>
          </div>
          <div>
            <div className="h-16 w-full bg-travel-purple/20 rounded-sm border border-travel-purple mb-2"></div>
            <div className="text-sm">Small (4px)</div>
            <div className="text-xs text-text-secondary">rounded-sm</div>
          </div>
          <div>
            <div className="h-16 w-full bg-travel-purple/20 rounded-md border border-travel-purple mb-2"></div>
            <div className="text-sm">Medium (8px)</div>
            <div className="text-xs text-text-secondary">rounded-md</div>
          </div>
          <div>
            <div className="h-16 w-full bg-travel-purple/20 rounded-lg border border-travel-purple mb-2"></div>
            <div className="text-sm">Large (12px)</div>
            <div className="text-xs text-text-secondary">rounded-lg</div>
          </div>
          <div>
            <div className="h-16 w-full bg-travel-purple/20 rounded-xl border border-travel-purple mb-2"></div>
            <div className="text-sm">XL (16px)</div>
            <div className="text-xs text-text-secondary">rounded-xl</div>
          </div>
          <div>
            <div className="h-16 w-full bg-travel-purple/20 rounded-full border border-travel-purple mb-2"></div>
            <div className="text-sm">Full (9999px)</div>
            <div className="text-xs text-text-secondary">rounded-full</div>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="mb-6">Shadows</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <div className="h-16 w-full bg-white rounded-md shadow-none mb-2"></div>
            <div className="text-sm">None</div>
            <div className="text-xs text-text-secondary">shadow-none</div>
          </div>
          <div>
            <div className="h-16 w-full bg-white rounded-md shadow-sm mb-2"></div>
            <div className="text-sm">Small</div>
            <div className="text-xs text-text-secondary">shadow-sm</div>
            <div className="text-xs text-text-secondary">0 1px 2px rgba(0, 0, 0, 0.05)</div>
          </div>
          <div>
            <div className="h-16 w-full bg-white rounded-md shadow-md mb-2"></div>
            <div className="text-sm">Medium</div>
            <div className="text-xs text-text-secondary">shadow-md</div>
            <div className="text-xs text-text-secondary">0 2px 8px rgba(0, 0, 0, 0.1)</div>
          </div>
          <div>
            <div className="h-16 w-full bg-white rounded-md shadow-lg mb-2"></div>
            <div className="text-sm">Large</div>
            <div className="text-xs text-text-secondary">shadow-lg</div>
            <div className="text-xs text-text-secondary">0 4px 12px rgba(0, 0, 0, 0.15)</div>
          </div>
          <div>
            <div className="h-16 w-full bg-white rounded-md shadow-xl mb-2"></div>
            <div className="text-sm">XL</div>
            <div className="text-xs text-text-secondary">shadow-xl</div>
            <div className="text-xs text-text-secondary">0 8px 16px rgba(0, 0, 0, 0.2)</div>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="mb-6">Components</h2>

        <h3 className="mb-4">Buttons</h3>
        <div className="flex flex-wrap gap-4 mb-8">
          <button className="btn-primary">Primary Button</button>
          <button className="btn-secondary">Secondary Button</button>
          <button className="btn-accent">Accent Button</button>
          <button className="btn-disabled">Disabled Button</button>
        </div>

        <h3 className="mb-4">Cards</h3>
        <div className="card mb-8 max-w-md">
          <h3 className="text-2xl font-semibold mb-2">Card Title</h3>
          <p className="text-text-secondary">
            Card content goes here. This demonstrates the standard card component with a title and
            some descriptive text.
          </p>
        </div>

        <h3 className="mb-4">Inputs</h3>
        <div className="mb-8 max-w-md">
          <input type="text" className="input mb-4" placeholder="Input placeholder" />
          <div className="flex gap-4">
            <input type="checkbox" id="checkbox" className="rounded text-travel-purple" />
            <label htmlFor="checkbox">Checkbox</label>
          </div>
        </div>

        <h3 className="mb-4">Tags/Badges</h3>
        <div className="flex flex-wrap gap-2 mb-8">
          <span className="tag">Tag Label</span>
          <span
            className="tag"
            style={{ backgroundColor: 'rgba(179, 217, 255, 0.2)', color: 'hsl(213, 100%, 50%)' }}
          >
            Blue Tag
          </span>
          <span
            className="tag"
            style={{ backgroundColor: 'rgba(255, 179, 217, 0.2)', color: 'hsl(330, 100%, 50%)' }}
          >
            Pink Tag
          </span>
          <span
            className="tag"
            style={{ backgroundColor: 'rgba(255, 224, 179, 0.2)', color: 'hsl(40, 100%, 50%)' }}
          >
            Yellow Tag
          </span>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="mb-6">Category Indicators</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="category-indicator">
            <div className="category-indicator-dot bg-accommodation"></div>
            <span className="category-text">Accommodation</span>
          </div>
          <div className="category-indicator">
            <div className="category-indicator-dot bg-food"></div>
            <span className="category-text">Food</span>
          </div>
          <div className="category-indicator">
            <div className="category-indicator-dot bg-transportation"></div>
            <span className="category-text">Transportation</span>
          </div>
          <div className="category-indicator">
            <div className="category-indicator-dot bg-activities"></div>
            <span className="category-text">Activities</span>
          </div>
          <div className="category-indicator">
            <div className="category-indicator-dot bg-shopping"></div>
            <span className="category-text">Shopping</span>
          </div>
          <div className="category-indicator">
            <div className="category-indicator-dot bg-other"></div>
            <span className="category-text">Other</span>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="mb-6">Status Indicators</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="status-indicator">
            <div className="status-indicator-dot bg-travel-mint"></div>
            <span>Active</span>
          </div>
          <div className="status-indicator">
            <div className="status-indicator-dot bg-travel-yellow"></div>
            <span>Pending</span>
          </div>
          <div className="status-indicator">
            <div className="status-indicator-dot bg-red-500"></div>
            <span>Inactive</span>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="mb-6">Progress Indicators</h2>
        <div className="max-w-md">
          <div className="progress-bar mb-4">
            <div className="progress-bar-fill" style={{ width: '25%' }}></div>
          </div>
          <div className="progress-bar mb-4">
            <div className="progress-bar-fill" style={{ width: '50%' }}></div>
          </div>
          <div className="progress-bar mb-4">
            <div className="progress-bar-fill" style={{ width: '75%' }}></div>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: '100%' }}></div>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="mb-6">Avatar with Status</h2>
        <div className="flex gap-8">
          <div className="avatar-container">
            <div className="avatar">
              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                UI
              </div>
            </div>
            <div className="avatar-status bg-travel-mint"></div>
          </div>

          <div className="avatar-container">
            <div className="avatar">
              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                UI
              </div>
            </div>
            <div className="avatar-status bg-travel-yellow"></div>
          </div>

          <div className="avatar-container">
            <div className="avatar">
              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                UI
              </div>
            </div>
            <div className="avatar-status bg-red-500"></div>
          </div>
        </div>
      </section>
    </div>
  ),
};

export const Light: Story = {
  render: () => (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="mb-12">WithMe.Travel Design System</h1>
      {/* ...copy all sections from the main DesignSystem.render here... */}
      {/* For brevity, use the same JSX as in the main DesignSystem.render function */}
    </div>
  ),
  parameters: {
    backgrounds: { default: 'light' },
  },
};

export const Dark: Story = {
  render: () => (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="mb-12">WithMe.Travel Design System</h1>
      {/* ...copy all sections from the main DesignSystem.render here... */}
      {/* For brevity, use the same JSX as in the main DesignSystem.render function */}
    </div>
  ),
  parameters: {
    backgrounds: { default: 'dark' },
  },
};
