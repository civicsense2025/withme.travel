'use client';

import React from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ExampleComponentProps {
  className?: string;
  title?: string;
}

/**
 * Example component showcasing the design system
 * This demonstrates how to use the design system's colors, typography, and components
 */
export function ExampleComponent({
  className,
  title = 'Design System Example',
}: ExampleComponentProps) {
  return (
    <div className={cn('p-6 bg-background rounded-lg border border-border', className)}>
      <h2 className="text-2xl font-bold text-foreground mb-4">{title}</h2>

      {/* Typography Examples */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-foreground mb-3">Typography</h3>
        <div className="space-y-2">
          <p className="text-4xl font-bold text-foreground">Heading 1</p>
          <p className="text-3xl font-bold text-foreground">Heading 2</p>
          <p className="text-2xl font-bold text-foreground">Heading 3</p>
          <p className="text-xl font-semibold text-foreground">Heading 4</p>
          <p className="text-lg font-medium text-foreground">Heading 5</p>
          <p className="text-base text-foreground">
            Body text with <span className="font-bold">bold</span> and{' '}
            <span className="italic">italic</span> styling
          </p>
          <p className="text-sm text-muted-foreground">Small text / caption</p>
        </div>
      </div>

      {/* Color Examples */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-foreground mb-3">Colors</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-primary mb-2"></div>
            <p className="text-sm text-foreground">Primary</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-secondary mb-2"></div>
            <p className="text-sm text-foreground">Secondary</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-accent mb-2"></div>
            <p className="text-sm text-foreground">Accent</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-muted mb-2"></div>
            <p className="text-sm text-foreground">Muted</p>
          </div>
        </div>
      </div>

      {/* Button Examples */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-foreground mb-3">Buttons</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="accent">Accent</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-4">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-4">
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </div>
      </div>

      {/* Card Example */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-foreground mb-3">Card Example</h3>
        <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
          <h4 className="text-lg font-medium text-card-foreground mb-2">Card Title</h4>
          <p className="text-muted-foreground mb-4">
            This is a card component using the design system colors and styling.
          </p>
          <Button variant="primary">Learn More</Button>
        </div>
      </div>

      {/* Form Elements Example */}
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-3">Form Elements</h3>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="example-input"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Text Input
            </label>
            <input
              id="example-input"
              type="text"
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground"
              placeholder="Enter text..."
            />
          </div>

          <div>
            <label
              htmlFor="example-select"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Select Input
            </label>
            <select
              id="example-select"
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground"
            >
              <option>Option 1</option>
              <option>Option 2</option>
              <option>Option 3</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
