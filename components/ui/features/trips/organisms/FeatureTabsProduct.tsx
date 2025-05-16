/**
 * FeatureTabsProduct
 *
 * A flexible, prop-driven marketing/demo component for showcasing group travel pain points in a tabbed layout.
 * Apple-inspired, responsive, and animated. Supports a simplified variant for marketing.
 *
 * @module features/trips/organisms/FeatureTabsProduct
 */

// ============================================================================
// IMPORTS
// ============================================================================

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  content: React.ReactNode;
  /** Optional action button for the tab */
  actionButton?: React.ReactNode;
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
  /** Variant: 'default' (full) or 'simplified' (minimal marketing) */
  variant?: 'default' | 'simplified';
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Product marketing tabbed feature component (pain-point focused, Apple-inspired, responsive, animated)
 *
 * @param props.tabs - Array of tab definitions
 * @param props.activeTabId - Controlled active tab id
 * @param props.onTabChange - Callback for tab change
 * @param props.className - Optional container className
 * @param props.defaultTabId - Initial tab for uncontrolled mode
 * @param props.variant - 'default' (full) or 'simplified' (minimal marketing)
 */
export function FeatureTabsProduct({
  tabs,
  activeTabId,
  onTabChange,
  className = '',
  defaultTabId,
  variant = 'default',
}: FeatureTabsProductProps) {
  // Internal state for uncontrolled mode
  const [internalTab, setInternalTab] = useState<string>(defaultTabId || tabs[0]?.id);

  // Keep internalTab in sync with defaultTabId if it changes
  useEffect(() => {
    if (defaultTabId && defaultTabId !== internalTab) {
      setInternalTab(defaultTabId);
    }
  }, [defaultTabId]);

  // Determine which tab is active
  const currentTabId = activeTabId ?? internalTab;
  const currentTab = tabs.find((t) => t.id === currentTabId) ?? tabs[0];

  // --- Layout shift prevention: measure tallest tab content and widest tab content ---
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined);
  const [maxWidth, setMaxWidth] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    // Measure all tab contents (hidden) to find the tallest and widest
    if (tabs.length === 0) return;
    const heights = tabs.map((_, i) => {
      const el = contentRefs.current[i];
      return el ? el.offsetHeight : 0;
    });
    const widths = tabs.map((_, i) => {
      const el = contentRefs.current[i];
      return el ? el.offsetWidth : 0;
    });
    const maxH = Math.max(...heights, 350); // fallback min
    const maxW = Math.max(...widths, 320); // fallback min
    setMaxHeight(maxH);
    setMaxWidth(maxW);
  }, [tabs]);

  // Animation variants for tab content
  const contentVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
    exit: { opacity: 0, y: -16, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } },
  };

  // Apple-inspired card styling with fixed max width
  const cardClass = clsx(
    'flex flex-col md:flex-row rounded-3xl shadow-lg border border-border bg-background/80 dark:bg-background/70',
    'overflow-hidden',
    'max-w-[900px] mx-auto', // Fixed max width and center
    className
  );

  // Sidebar width
  const sidebarWidth = 'w-64';

  const effectiveMaxHeight = maxHeight !== undefined ? maxHeight + 50 : 500; // Default to 500 if undefined
  const effectiveMaxWidth = maxWidth !== undefined ? Math.min(maxWidth + 32, 700) : 700; // Add a little padding, cap at 700

  return (
    <div className={cardClass}>
      {/* Sidebar */}
      <div
        className={clsx(
          sidebarWidth,
          'flex-shrink-0 flex flex-col gap-2 py-8 px-4 bg-muted/60 dark:bg-muted/40 border-r border-border',
          'justify-center',
          maxHeight ? `min-h-[${maxHeight}px]` : 'min-h-[400px] md:min-h-[450px] lg:min-h-[500px]'
        )}
        style={maxHeight ? { minHeight: maxHeight } : undefined}
      >
        <div className="flex flex-col gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={clsx(
                'flex items-center gap-3 rounded-xl px-4 py-3 transition-colors font-bold text-left',
                'text-base md:text-lg',
                currentTabId === tab.id
                  ? 'bg-card text-foreground border border-primary shadow-sm'
                  : 'text-muted-foreground hover:bg-accent/60',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'
              )}
              style={{ minHeight: 56 }}
              onClick={() => {
                if (!activeTabId) setInternalTab(tab.id);
                onTabChange?.(tab.id);
              }}
              aria-current={currentTabId === tab.id}
              tabIndex={0}
            >
              <span className="text-2xl md:text-3xl mr-2">{tab.emoji}</span>
              <span className="flex flex-col">
                <span>{tab.label}</span>
                {variant === 'default' && tab.subtext && (
                  <span className="text-xs text-muted-foreground font-normal leading-tight mt-0.5 truncate max-w-[140px]" style={{lineHeight: '1.2'}}>
                    {/* Condensed subtext */}
                    {tab.subtext}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area - fixed size, responsive, design system tokens */}
      <div
        className={clsx(
          'flex-1 flex flex-col items-center justify-center',
          'p-6 md:p-10 lg:p-12',
          'transition-all duration-300 ease-in-out',
          'w-full',
          'bg-background',
          'max-w-[700px]',
          maxHeight ? '' : 'min-h-[400px] md:min-h-[450px] lg:min-h-[500px]'
        )}
        style={maxHeight ? { minHeight: effectiveMaxHeight, minWidth: effectiveMaxWidth, maxWidth: 700, maxHeight: effectiveMaxHeight, overflowY: 'auto' } : { maxWidth: 700, minWidth: 0 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentTab.id}
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={clsx('w-full h-full flex flex-col items-center justify-center')}
            style={{ minHeight: effectiveMaxHeight, minWidth: effectiveMaxWidth, maxHeight: effectiveMaxHeight, maxWidth: 700, overflowY: 'auto', position: 'relative' }}
          >
            {tabs.map((tab, i) => (
              <div
                key={tab.id}
                ref={el => {
                  contentRefs.current[i] = el;
                }}
                style={{
                  display: tab.id === currentTab.id ? 'flex' : 'none',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: 'auto',
                  maxWidth: 700,
                }}
              >
                {tab.id === currentTab.id ? tab.content : null}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
} 