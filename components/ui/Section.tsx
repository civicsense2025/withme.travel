'use client';

/**
 * @file Section.tsx
 * @description
 *   A highly type-safe, polymorphic Section component with advanced layout features.
 *   Supports responsive spacing, semantics, accessibility, and various content arrangements.
 */

// ============================================================================
// IMPORTS
// ============================================================================

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Component, forwardRef, type ForwardRefRenderFunction } from 'react';
import { HTMLAttributes } from 'react';

// ============================================================================
// VARIANTS & STYLES DEFINITION
// ============================================================================

/**
 * Section container styles using class-variance-authority for type-safe variants
 */
const sectionVariants = cva('relative', {
  variants: {
    variant: {
      default: 'bg-background',
      card: 'bg-card border rounded-lg shadow-sm',
      muted: 'bg-muted/60 rounded-lg',
      transparent: '',
      primary: 'bg-primary/10 rounded-lg',
      highlight: 'bg-primary-foreground border-l-4 border-primary',
    },
    padding: {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-12',
    },
    width: {
      default: 'max-w-3xl mx-auto',
      full: 'w-full',
      narrow: 'max-w-xl mx-auto',
      wide: 'max-w-5xl mx-auto',
      ultraWide: 'max-w-7xl mx-auto',
    },
    border: {
      none: 'border-0',
      default: 'border',
      subtle: 'border border-muted',
    },
    rounded: {
      none: 'rounded-none',
      sm: 'rounded',
      md: 'rounded-lg',
      lg: 'rounded-xl',
      full: 'rounded-3xl',
    },
  },
  defaultVariants: {
    variant: 'default',
    padding: 'md',
    width: 'default',
    border: 'none',
    rounded: 'none',
  },
  compoundVariants: [
    {
      variant: 'card',
      border: 'none',
      class: 'border',
    },
  ],
});

/**
 * Header styles using class-variance-authority
 */
const headerVariants = cva('', {
  variants: {
    spacing: {
      default: 'mb-4',
      compact: 'mb-2',
      loose: 'mb-6',
      none: '',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
    divider: {
      none: '',
      subtle: 'pb-2 border-b border-border',
      full: 'pb-2 border-b-2 border-border',
    },
  },
  defaultVariants: {
    spacing: 'default',
    align: 'left',
    divider: 'none',
  },
});

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// Variant props from the cva definitions
type SectionVariantProps = VariantProps<typeof sectionVariants>;
type HeaderVariantProps = VariantProps<typeof headerVariants>;

// Base Section component props without HTML attributes
interface BaseSectionProps extends SectionVariantProps, HeaderVariantProps {
  /** Section heading (optional, string or ReactNode) */
  title?: React.ReactNode;
  /** Heading level for the section (h1-h6) */
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  /** Custom class for the title element */
  titleClassName?: string;
  /** Section subheading or description (optional, string or ReactNode) */
  description?: React.ReactNode;
  /** Custom class for the description element */
  descriptionClassName?: string;
  /** Section content */
  children: React.ReactNode;
  /** Custom className for the section */
  className?: string;
  /** ID for the section (used for linking and accessibility) */
  id?: string;
  /** If true, section is full-bleed (removes max-width constraints) */
  fullBleed?: boolean;
  /** Add an aria-labelledby linking to the title */
  ariaLabelledBy?: boolean;
  /** Responsive padding for different screen sizes */
  responsivePadding?: {
    sm?: SectionVariantProps['padding'];
    md?: SectionVariantProps['padding'];
    lg?: SectionVariantProps['padding'];
  };
  /** Responsive width for different screen sizes */
  responsiveWidth?: {
    sm?: SectionVariantProps['width'];
    md?: SectionVariantProps['width'];
    lg?: SectionVariantProps['width'];
  };
  /** Override or add actions to the section header */
  headerActions?: React.ReactNode;
  /** Container element around the children */
  contentClassName?: string;
}

// Define the exported section variant types for external use
export type SectionVariant = NonNullable<SectionVariantProps['variant']>;

// ============================================================================
// COMPONENT TYPE DEFINITION
// ============================================================================

// Type for the Section component with polymorphic behavior
type SectionComponent = {
  <C extends React.ElementType = 'section'>(
    props: BaseSectionProps & 
      { as?: C } & 
      Omit<React.ComponentPropsWithoutRef<C>, keyof BaseSectionProps | 'as'> & 
      { ref?: React.ComponentPropsWithRef<C>['ref'] }
  ): React.ReactElement;
  displayName?: string;
};

// ============================================================================
// COMPONENT IMPLEMENTATION
// ============================================================================

/**
 * Implementation function without generics for easier type checking
 */
const SectionImpl: React.ForwardRefRenderFunction<HTMLElement, BaseSectionProps> = (
  {
    title,
    description,
    headingLevel = 'h2',
    titleClassName,
    descriptionClassName,
    variant,
    padding,
    width,
    border,
    rounded,
    spacing,
    align,
    divider,
    fullBleed = false,
    children,
    className,
    id,
    ariaLabelledBy = false,
    responsivePadding,
    responsiveWidth,
    headerActions,
    contentClassName,
    ...rest
  },
  ref
) => {
  const HeadingComponent = headingLevel as React.ElementType;
  
  // Generate a unique ID for heading if ariaLabelledBy is true
  const headingId = ariaLabelledBy 
    ? (id ? `${id}-heading` : `section-heading-${Math.random().toString(36).substring(2, 9)}`) 
    : undefined;
  
  // Override width if fullBleed is true (backwards compatibility)
  const effectiveWidth = fullBleed ? 'full' : width;
  
  // Process responsive padding classes
  const responsivePaddingClasses = responsivePadding
    ? Object.entries(responsivePadding)
        .map(([breakpoint, value]) => 
          value ? `${breakpoint}:p-${value === 'none' ? '0' : value}` : null
        )
        .filter(Boolean)
    : [];

  // Process responsive width classes
  const responsiveWidthClasses = responsiveWidth
    ? Object.entries(responsiveWidth)
        .map(([breakpoint, value]) => {
          if (!value) return null;
          const widthClass = value === 'full' ? 'w-full' : `max-w-${value}`;
          return `${breakpoint}:${widthClass}`;
        })
        .filter(Boolean)
    : [];

  // Render title based on type
  const renderTitle = () => {
    if (!title) return null;
    
    return (
      <HeadingComponent 
        id={headingId}
        className={cn(
          "text-xl font-semibold",
          titleClassName
        )}
      >
        {title}
      </HeadingComponent>
    );
  };

  // Render description based on type
  const renderDescription = () => {
    if (!description) return null;
    
    if (typeof description === 'string' || typeof description === 'number') {
      return (
        <p className={cn(
          "text-muted-foreground text-base mt-1",
          descriptionClassName
        )}>
          {description}
        </p>
      );
    }
    
    return description;
  };

  // Generate aria attributes for accessibility
  const ariaAttrs = ariaLabelledBy && headingId 
    ? { 'aria-labelledby': headingId } 
    : {};

  return (
    <Component
      ref={ref}
      className={cn(
        sectionVariants({
          variant,
          padding,
          width: effectiveWidth,
          border,
          rounded,
        }),
        ...responsivePaddingClasses,
        ...responsiveWidthClasses,
        className
      )}
      id={id}
      {...ariaAttrs}
      {...rest}
    >
      {(title || description || headerActions) && (
        <header className={cn(
          headerVariants({
            spacing,
            align,
            divider,
          })
        )}>
          <div className={cn(
            "flex items-start gap-4",
            headerActions ? "justify-between" : ""
          )}>
            <div className={cn(align === 'center' && 'mx-auto', align === 'right' && 'ml-auto')}>
              {renderTitle()}
              {renderDescription()}
            </div>
            {headerActions && (
              <div className="flex-shrink-0">
                {headerActions}
              </div>
            )}
          </div>
        </header>
      )}
      <div className={contentClassName}>
        {children}
      </div>
    </Component>
  );
};

// Create the component with a proper type cast to support polymorphic behavior
export const Section = React.forwardRef(SectionImpl) as SectionComponent;

Section.displayName = 'Section';

// ============================================================================
// CONVENIENCE COMPONENTS
// ============================================================================

// Define the specialized component types with corrected TypeScript syntax
type CardProps = Omit<
  React.ComponentPropsWithRef<typeof Section> & { as?: 'div' },
  'variant' | 'rounded' | 'padding'
>;

type ContentSectionProps = Omit<
  React.ComponentPropsWithRef<typeof Section>,
  'variant' | 'padding'
>;

type PanelProps = Omit<
  React.ComponentPropsWithRef<typeof Section> & { as?: 'div' },
  'variant' | 'padding' | 'rounded'
>;

type CalloutSectionProps = Omit<
  React.ComponentPropsWithRef<typeof Section>,
  'variant' | 'padding'
>;

// Card component
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (props, ref) => (
    <Section
      ref={ref as React.Ref<HTMLDivElement>}
      as="div"
      variant="card"
      rounded="md"
      padding="md"
      {...props}
    />
  )
);

Card.displayName = 'Card';

// ContentSection component
export const ContentSection = React.forwardRef<HTMLElement, ContentSectionProps>(
  (props, ref) => (
    <Section
      ref={ref}
      variant="default"
      padding="lg"
      {...props}
    />
  )
);

ContentSection.displayName = 'ContentSection';

// Panel component
export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  (props, ref) => (
    <Section
      ref={ref as React.Ref<HTMLDivElement>}
      as="div"
      variant="muted"
      padding="md"
      rounded="md"
      {...props}
    />
  )
);

Panel.displayName = 'Panel';

// CalloutSection component
export const CalloutSection = React.forwardRef<HTMLElement, CalloutSectionProps>(
  (props, ref) => (
    <Section
      ref={ref}
      variant="highlight"
      padding="md"
      {...props}
    />
  )
);

CalloutSection.displayName = 'CalloutSection';

// ============================================================================
// EXPORTS
// ============================================================================

// Export the component variants for styling utilities
export { sectionVariants, headerVariants };

// Export the component prop types for external use
export type { 
  BaseSectionProps, 
  CardProps,
  ContentSectionProps,
  PanelProps, 
  CalloutSectionProps
};