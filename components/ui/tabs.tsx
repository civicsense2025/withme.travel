'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * Root Tabs component that manages tab state.
 *
 * @example
 * <Tabs defaultValue="tab1">
 *   <TabsList>
 *     <TabsTrigger value="tab1">Account</TabsTrigger>
 *     <TabsTrigger value="tab2">Password</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="tab1">Account settings...</TabsContent>
 *   <TabsContent value="tab2">Password settings...</TabsContent>
 * </Tabs>
 */
const Tabs = TabsPrimitive.Root;

/**
 * Container for all tab triggers. Acts as an accessible navigation element.
 */
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'flex overflow-x-auto whitespace-nowrap scrollbar-hide no-scrollbar gap-2 md:gap-4 px-1 md:px-2',
      className
    )}
    style={{ WebkitOverflowScrolling: 'touch' }}
    aria-orientation="horizontal"
    role="tablist"
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const tabsTriggerVariants = cva(
  'relative bg-transparent border-0 px-2 md:px-4 py-2 text-lg md:text-xl font-light text-muted-foreground opacity-70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:z-10 whitespace-nowrap',
  {
    variants: {
      variant: {
        default:
          'data-[state=active]:text-travel-purple data-[state=active]:border-b-4 data-[state=active]:border-travel-purple data-[state=active]:font-extrabold data-[state=active]:opacity-100 data-[state=inactive]:font-normal data-[state=inactive]:opacity-50',
        'travel-purple':
          'data-[state=active]:text-travel-purple data-[state=active]:border-b-4 data-[state=active]:border-travel-purple',
        'travel-blue':
          'data-[state=active]:text-travel-blue data-[state=active]:border-b-4 data-[state=active]:border-travel-blue',
        'travel-pink':
          'data-[state=active]:text-travel-pink data-[state=active]:border-b-4 data-[state=active]:border-travel-pink',
        'travel-yellow':
          'data-[state=active]:text-travel-yellow data-[state=active]:border-b-4 data-[state=active]:border-travel-yellow',
        'travel-mint':
          'data-[state=active]:text-travel-mint data-[state=active]:border-b-4 data-[state=active]:border-travel-mint',
        'travel-peach':
          'data-[state=active]:text-travel-peach data-[state=active]:border-b-4 data-[state=active]:border-travel-peach',
        success:
          'data-[state=active]:text-emerald-600 data-[state=active]:border-b-4 data-[state=active]:border-emerald-500',
        warning:
          'data-[state=active]:text-amber-600 data-[state=active]:border-b-4 data-[state=active]:border-amber-400',
        info: 'data-[state=active]:text-blue-600 data-[state=active]:border-b-4 data-[state=active]:border-blue-500',
        error:
          'data-[state=active]:text-red-600 data-[state=active]:border-b-4 data-[state=active]:border-red-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
    VariantProps<typeof tabsTriggerVariants> {
  /** Custom label for screen readers if the visible tab text is insufficient */
  ariaLabel?: string;
}

/**
 * TabsTrigger with design system variants.
 * Each trigger must have a unique value prop that corresponds to a TabsContent component.
 *
 * @example
 * <TabsTrigger
 *   value="settings"
 *   variant="travel-purple"
 *   ariaLabel="Account settings options"
 * >
 *   Account
 * </TabsTrigger>
 */
const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, variant, ariaLabel, ...props }, ref) => {
  // Scroll the tab into view when clicked
  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (ref && typeof ref !== 'function' && ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    } else if (e.currentTarget) {
      e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    if (props.onClick) props.onClick(e);
  };

  // Log to keyboard users that they can use arrow keys for tab navigation
  const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
    if (props.onFocus) props.onFocus(e);
    // Only announce on keyboard focus, not mouse click focus
    if (e.target?.matches(':focus-visible')) {
      const msg = new Set(document.querySelectorAll('[data-a11y-tabs-message]'));
      if (msg.size === 0) {
        const srMsg = document.createElement('div');
        srMsg.setAttribute('data-a11y-tabs-message', 'true');
        srMsg.setAttribute('aria-live', 'polite');
        srMsg.setAttribute(
          'style',
          'position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;'
        );
        srMsg.textContent = 'Use arrow keys to navigate between tabs';
        document.body.appendChild(srMsg);
        // Remove after announcement
        setTimeout(() => {
          document.body.removeChild(srMsg);
        }, 3000);
      }
    }
  };

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(tabsTriggerVariants({ variant, className }))}
      onClick={handleClick}
      onFocus={handleFocus}
      aria-label={ariaLabel}
      {...props}
    />
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

/**
 * Content container that is shown when the corresponding tab is active.
 * Must have a value prop that matches a TabsTrigger.
 *
 * @example
 * <TabsContent value="settings" className="py-4">
 *   Settings content goes here
 * </TabsContent>
 */
const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className
    )}
    role="tabpanel"
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
