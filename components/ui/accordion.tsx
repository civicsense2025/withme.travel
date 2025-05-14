'use client';

import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * Root accordion component that contains all accordion items.
 *
 * @example
 * <Accordion type="single" collapsible>
 *   <AccordionItem value="item-1">
 *     <AccordionTrigger>Is it accessible?</AccordionTrigger>
 *     <AccordionContent>Yes, it follows WAI-ARIA design patterns.</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 */
const Accordion = AccordionPrimitive.Root;

const accordionItemVariants = cva('border-b', {
  variants: {
    variant: {
      default: '',
      'travel-purple': 'border-travel-purple',
      'travel-blue': 'border-travel-blue',
      'travel-pink': 'border-travel-pink',
      'travel-yellow': 'border-travel-yellow',
      'travel-mint': 'border-travel-mint',
      'travel-peach': 'border-travel-peach',
      success: 'border-emerald-500',
      warning: 'border-amber-400',
      info: 'border-blue-500',
      error: 'border-red-500',
    },
    radius: {
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      full: 'rounded-full',
      none: 'rounded-none',
    },
  },
  defaultVariants: {
    variant: 'default',
    radius: 'none',
  },
});

export interface AccordionItemProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>,
    VariantProps<typeof accordionItemVariants> {}

/**
 * AccordionItem with design system variants.
 * Each item should have a unique value prop.
 *
 * @example
 * <AccordionItem value="item-1" variant="travel-purple" radius="md">
 *   <AccordionTrigger>Section Title</AccordionTrigger>
 *   <AccordionContent>Section content details</AccordionContent>
 * </AccordionItem>
 */
const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  AccordionItemProps
>(({ className, variant, radius, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(accordionItemVariants({ variant, radius, className }))}
    {...props}
  />
));
AccordionItem.displayName = 'AccordionItem';

/**
 * Trigger button for the accordion item.
 * When clicked, it toggles the visibility of the associated AccordionContent.
 */
const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false);

  // Update state based on accordion state changes
  const handleStateChange = (e: React.SyntheticEvent<HTMLButtonElement>) => {
    // @ts-ignore - data-state is a valid attribute added by Radix UI
    setIsOpen(e.currentTarget.dataset.state === 'open');
  };

  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&[data-state=open]>svg]:rotate-180',
          className
        )}
        onFocus={handleStateChange}
        onClick={handleStateChange}
        {...props}
      >
        <span className="text-left">{children}</span>
        <ChevronDown
          className="h-4 w-4 shrink-0 transition-transform duration-200"
          aria-hidden="true"
        />
        <span className="sr-only">{isOpen ? 'Collapse' : 'Expand'} section</span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

/**
 * Content container for the accordion item.
 * This is shown or hidden based on the expanded state of the accordion item.
 */
const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn('pb-4 pt-0', className)}>{children}</div>
  </AccordionPrimitive.Content>
));

AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
