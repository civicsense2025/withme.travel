'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';

import { cn } from '@/lib/utils';

const Tabs = TabsPrimitive.Root;

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
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => {
  // Scroll the tab into view when clicked
  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (ref && typeof ref !== 'function' && ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    } else if (e.currentTarget) {
      e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    if (props.onClick) props.onClick(e);
  };
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        'relative bg-transparent border-0 px-2 md:px-4 py-2 text-base font-medium text-muted-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-travel-purple focus-visible:z-10 whitespace-nowrap',
        'data-[state=active]:text-travel-purple data-[state=active]:border-b-2 data-[state=active]:border-travel-purple',
        className
      )}
      tabIndex={0}
      onClick={handleClick}
      {...props}
    />
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

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
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
