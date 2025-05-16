/**
 * FeatureTabsProduct Stories
 *
 * Demonstrates the marketing/demo use case for the tabbed feature component.
 */

// ============================================================================
// IMPORTS
// ============================================================================

import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { motion } from 'framer-motion';

import { FeatureTabsProduct, FeatureTab } from '../organisms/FeatureTabsProduct';
import { ThemeToggle } from '@/components/ui/atoms/ThemeToggle';

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

// Typing animation for budget tip
const TypingTip = () => {
  const [displayed, setDisplayed] = React.useState('');
  const tip = 'Book Machu Picchu trek as a group for a discount';
  
  React.useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(tip.slice(0, i + 1));
      i++;
      if (i === tip.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, []);
  
  return <span className="text-xs text-muted-foreground font-mono">{displayed}</span>;
};

// ============================================================================
// SAMPLE DATA
// ============================================================================

const sampleTabs: FeatureTab[] = [
  {
    id: 'ideas',
    emoji: '💡',
    label: 'Stop Losing Ideas',
    subtext: 'No more scattered group chat suggestions',
    content: (
      <div className="space-y-4">
        <div className="bg-card rounded-xl p-4 border border-border flex items-center gap-2">
          <span className="text-lg">🦙</span>
          <span className="font-medium text-foreground">Machu Picchu sunrise trek</span>
          <span className="text-xs text-muted-foreground ml-2">Let's do the 4-day Inca Trail, not just the train!</span>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border flex items-center gap-2">
          <span className="text-lg">🧂</span>
          <span className="font-medium text-foreground">Uyuni Salt Flats photo tour</span>
          <span className="text-xs text-muted-foreground ml-2">Can we do the mirror effect at sunset?</span>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border flex items-center gap-2">
          <span className="text-lg">🍷</span>
          <span className="font-medium text-foreground">Mendoza wine bike tour</span>
          <span className="text-xs text-muted-foreground ml-2">Local guide, picnic lunch at Bodega La Azul</span>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border flex items-center gap-2">
          <span className="text-lg">💃</span>
          <span className="font-medium text-foreground">Buenos Aires tango night</span>
          <span className="text-xs text-muted-foreground ml-2">Milonga with a free lesson on Sunday</span>
        </div>
      </div>
    ),
  },
  {
    id: 'debates',
    emoji: '📊',
    label: 'End The Debates',
    subtext: 'Decide together, no endless threads',
    content: (
      <div className="space-y-4">
        <div className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🦙</span>
            <span className="font-medium text-foreground">Machu Picchu trek</span>
          </div>
          <span className="text-xs text-muted-foreground">$650</span>
          <div className="flex gap-1">
            <motion.span animate={{ scale: 1.1 }} className="text-green-500">👍 5</motion.span>
            <span className="text-gray-400">👎 0</span>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🧂</span>
            <span className="font-medium text-foreground">Uyuni Salt Flats</span>
          </div>
          <span className="text-xs text-muted-foreground">$120</span>
          <div className="flex gap-1">
            <span className="text-green-500">👍 4</span>
            <motion.span animate={{ scale: 1.1 }} className="text-gray-400">👎 1</motion.span>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🍷</span>
            <span className="font-medium text-foreground">Mendoza wine tour</span>
          </div>
          <span className="text-xs text-muted-foreground">$60</span>
          <div className="flex gap-1">
            <span className="text-green-500">👍 3</span>
            <span className="text-gray-400">👎 2</span>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">💃</span>
            <span className="font-medium text-foreground">Tango night</span>
          </div>
          <span className="text-xs text-muted-foreground">$15</span>
          <div className="flex gap-1">
            <motion.span animate={{ scale: 1.1 }} className="text-green-500">👍 5</motion.span>
            <span className="text-gray-400">👎 0</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'budget',
    emoji: '💰',
    label: 'Money Peace',
    subtext: 'No more awkward money talks',
    content: (
      <div className="space-y-4">
        <div className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
          <span className="font-medium text-foreground">Group Budget</span>
          <span className="text-xs text-muted-foreground">$1,200/person</span>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
          <span className="font-medium text-foreground">Everyone agreed</span>
          <span className="text-green-500">✔️</span>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border flex items-center gap-2">
          <span className="font-medium text-foreground">Money-saving tip</span>
          <TypingTip />
        </div>
        <div className="bg-card rounded-xl p-4 border border-border flex items-center gap-2">
          <span className="font-medium text-foreground">Shared costs</span>
          <span className="text-xs text-muted-foreground">Let's use Splitwise</span>
        </div>
      </div>
    ),
  },
  {
    id: 'plans',
    emoji: '🗺️',
    label: 'Create Real Plans',
    subtext: 'Turn ideas into an actual itinerary',
    content: (
      <div className="space-y-4">
        <div className="bg-card rounded-xl p-4 border border-border flex items-center gap-2">
          <span className="text-lg">🦙</span>
          <span className="font-medium text-foreground">Day 2: Machu Picchu trek</span>
          <span className="text-xs text-muted-foreground ml-2">Start 5am, camp at Wayllabamba</span>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border flex items-center gap-2">
          <span className="text-lg">🧂</span>
          <span className="font-medium text-foreground">Day 5: Uyuni Salt Flats</span>
          <span className="text-xs text-muted-foreground ml-2">Sunset photos, salt hotel</span>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border flex items-center gap-2">
          <span className="text-lg">🍷</span>
          <span className="font-medium text-foreground">Day 8: Mendoza wine tour</span>
          <span className="text-xs text-muted-foreground ml-2">Picnic at Bodega La Azul</span>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border flex items-center gap-2">
          <span className="text-lg">💃</span>
          <span className="font-medium text-foreground">Day 10: Buenos Aires tango night</span>
          <span className="text-xs text-muted-foreground ml-2">La Viruta, 8pm</span>
        </div>
      </div>
    ),
  },
];

// ============================================================================
// STORYBOOK METADATA
// ============================================================================

/**
 * ## Feature Tabs Product
 * 
 * A tabbed interface for showcasing product features in marketing materials.
 * This component animates between different feature examples to demonstrate 
 * the value proposition of the product.
 * 
 * ### Usage Guidelines
 * - Use on marketing pages to demonstrate core product functionality
 * - Each tab should highlight a distinct value proposition
 * - Include both visual and textual elements in each tab
 */
const meta: Meta<typeof FeatureTabsProduct> = {
  title: 'Features/Trips/FeatureTabsProduct',
  component: FeatureTabsProduct,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    componentSubtitle: 'Interactive showcase of product features with tabbed navigation',
    docs: {
      description: {
        component: 'A tabbed component for showcasing product features in marketing materials. Demonstrates product value proposition through interactive examples.'
      }
    }
  },
  argTypes: {
    activeTabId: { 
      description: 'The currently active tab', 
      control: 'select', 
      options: ['ideas', 'debates', 'budget', 'plans'],
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'ideas' },
      }
    },
    variant: { 
      description: 'The visual style of the tabs', 
      control: 'radio', 
      options: ['default', 'simplified'],
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      }
    },
    tabs: {
      description: 'Array of tab configurations with content',
      table: {
        type: { summary: 'FeatureTab[]' }
      }
    }
  },
  args: {
    variant: 'default',
    activeTabId: 'ideas',
    tabs: sampleTabs
  }
};

export default meta;
type Story = StoryObj<typeof FeatureTabsProduct>;

// ============================================================================
// STORIES
// ============================================================================

/**
 * Default state with ideas tab active
 */
export const Default: Story = {};

/**
 * Displaying the debates tab
 */
export const DebatesTab: Story = {
  args: {
    activeTabId: 'debates',
  },
};

/**
 * Displaying the budget tab
 */
export const BudgetTab: Story = {
  args: {
    activeTabId: 'budget',
  },
};

/**
 * Simplified variant for marketing
 */
export const SimplifiedVariant: Story = {
  args: {
    variant: 'simplified',
  },
}; 