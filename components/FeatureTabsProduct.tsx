/**
 * FeatureTabsProduct
 *
 * A flexible, prop-driven marketing/demo component for showcasing group travel pain points in a tabbed layout.
 * Designed for use in landing pages, product tours, and Storybook.
 *
 * @module components/FeatureTabsProduct
 */

// ============================================================================
// IMPORTS
// ============================================================================

import React, { useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Tab definition for FeatureTabsProduct
 */
export interface FeatureTab {
  /** Unique tab identifier */
  id: string;
  /** Tab label (pain point) */
  label: string;
  /** Tab emoji (required, for visual identity) */
  emoji: string;
  /** Optional subtext for the tab (pain point explanation) */
  subtext?: string;
  /** Main content for the tab */
  content: ReactNode;
  /** Optional action button for the tab */
  actionButton?: ReactNode;
}

/**
 * Props for FeatureTabsProduct
 */
export interface FeatureTabsProductProps {
  /** Array of tab definitions */
  tabs: FeatureTab[];
  /** Controlled active tab id (optional) */
  activeTabId?: string;
  /** Callback when tab changes (for controlled mode) */
  onTabChange?: (tabId: string) => void;
  /** Optional className for container */
  className?: string;
  /** Optional initial tab id (for uncontrolled mode) */
  defaultTabId?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Product marketing tabbed feature component (pain-point focused)
 *
 * @param props.tabs - Array of tab definitions
 * @param props.activeTabId - Controlled active tab id
 * @param props.onTabChange - Callback for tab change
 * @param props.className - Optional container className
 * @param props.defaultTabId - Initial tab for uncontrolled mode
 */
export function FeatureTabsProduct({
  tabs,
  activeTabId,
  onTabChange,
  className = '',
  defaultTabId,
}: FeatureTabsProductProps) {
  // Internal state for uncontrolled mode
  const [internalTab, setInternalTab] = useState<string>(
    defaultTabId || tabs[0]?.id || ''
  );
  const currentTabId = activeTabId ?? internalTab;
  const currentTab = tabs.find((tab) => tab.id === currentTabId) || tabs[0];

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    if (activeTabId === undefined) {
      setInternalTab(tabId);
    }
    onTabChange?.(tabId);
  };

  return (
    <div
      className={clsx(
        'max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-sm border border-border bg-background',
        className
      )}
      data-testid="feature-tabs-product"
    >
      <div className="flex">
        {/* Sidebar Tabs - wider, emoji only, pain point labels */}
        <div className="w-64 bg-muted p-6 border-r border-border flex flex-col gap-2">
          <div className="flex flex-col gap-2">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                className={clsx(
                  'w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors',
                  currentTabId === tab.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent'
                )}
                onClick={() => handleTabChange(tab.id)}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                type="button"
              >
                <span className="text-2xl mt-0.5">{tab.emoji}</span>
                <span className="flex flex-col items-start">
                  <span className="text-base font-semibold leading-tight">{tab.label}</span>
                  {tab.subtext && (
                    <span className="text-xs text-muted-foreground leading-snug mt-0.5">{tab.subtext}</span>
                  )}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-8 bg-background">
          <motion.div
            key={currentTab?.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-foreground">{currentTab?.label}</h2>
              {currentTab?.actionButton}
            </div>
            <div>{currentTab?.content}</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default FeatureTabsProduct; 