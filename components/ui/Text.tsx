'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ============================================================================
// STYLE VARIANTS
// ============================================================================

const textVariants = cva('', {
  variants: {
    variant: {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      strong: 'font-semibold text-foreground',
      faded: 'opacity-60 text-foreground',
      body: 'text-base text-foreground',
      label: 'text-xs font-medium uppercase tracking-wide text-muted-foreground',
      caption: 'text-xs text-muted-foreground',
      heading: 'font-bold text-foreground',
    },
    size: {
      xs: 'text-xs',
      sm: 'text-sm leading-tight',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
    alignment: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
    decoration: {
      none: '',
      underline: 'underline underline-offset-4',
      lineThrough: 'line-through',
    },
    truncate: {
      true: 'truncate overflow-hidden text-ellipsis whitespace-nowrap',
    },
    emphasis: {
      strong: 'font-semibold',
      faded: 'opacity-60',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
    weight: 'normal',
    alignment: 'left',
    decoration: 'none',
  },
});

// ============================================================================
// TYPES
// ============================================================================

type TextVariantProps = VariantProps<typeof textVariants>;

// Base Text component props (without the HTML element specific props)
interface BaseTextProps extends TextVariantProps {
  className?: string;
  responsiveSize?: {
    sm?: TextVariantProps['size'];
    md?: TextVariantProps['size'];
    lg?: TextVariantProps['size'];
  };
  srOnly?: boolean;
  selectable?: boolean;
  lines?: number;
  children?: React.ReactNode;
}

// ============================================================================
// COMPONENT
// ============================================================================

// This approach separates the component type from its implementation
type TextComponent = {
  <C extends React.ElementType = 'span'>(
    props: BaseTextProps & 
      { as?: C } & 
      Omit<React.ComponentPropsWithoutRef<C>, keyof BaseTextProps | 'as'> & 
      { ref?: React.ComponentPropsWithRef<C>['ref'] }
  ): React.ReactElement | null;
  displayName?: string;
};

// Implementation function without the generics in the forwardRef call
const TextImpl: React.ForwardRefRenderFunction<HTMLSpanElement, BaseTextProps & { as?: React.ElementType }> = (
  {
    children,
    as: Component = 'span',
    className,
    variant,
    size,
    weight,
    alignment,
    decoration,
    truncate,
    emphasis,
    responsiveSize,
    srOnly,
    selectable = true,
    lines,
    ...rest
  }, 
  ref
) => {
  // Process responsive size classes
  const responsiveSizeClasses = responsiveSize
    ? Object.entries(responsiveSize)
        .map(([breakpoint, value]) => 
          value ? `${breakpoint}:text-${value}` : null
        )
        .filter(Boolean)
    : [];

  // Line clamp classes
  const lineClampClass = lines ? `line-clamp-${lines}` : '';

  // Screen reader class
  const srOnlyClass = srOnly ? 'sr-only' : '';

  // Text selection classes
  const selectableClass = !selectable ? 'select-none' : 'select-text';

  return (
    <Component
      ref={ref}
      className={cn(
        textVariants({ variant, size, weight, alignment, decoration, truncate, emphasis }),
        ...responsiveSizeClasses,
        lineClampClass,
        srOnlyClass,
        selectableClass,
        className
      )}
      {...rest}
    >
      {children}
    </Component>
  );
};

// Create the component with a proper type cast
const Text = React.forwardRef(TextImpl) as TextComponent;

Text.displayName = 'Text';

// ============================================================================
// CONVENIENCE COMPONENTS
// ============================================================================

// Types for convenience components
type HeadingProps = Omit<React.ComponentPropsWithRef<typeof Text>, 'as'> & {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  level?: 1 | 2 | 3 | 4 | 5 | 6;
};

type ParagraphProps = Omit<React.ComponentPropsWithRef<typeof Text>, 'as'>;

type VisuallyHiddenProps = Omit<React.ComponentPropsWithRef<typeof Text>, 'as' | 'srOnly'>;

// Heading component
const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level = 2, as, size, ...props }, ref) => {
    // Map level to size if size not provided
    const defaultSizes: Record<number, TextVariantProps['size']> = {
      1: '3xl',
      2: '2xl',
      3: 'xl',
      4: 'lg',
      5: 'md',
      6: 'sm',
    };

    // Use the heading level as the element type if "as" is not specified
    const headingElement = as || (`h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6');
    const headingSize = size || defaultSizes[level];

    return (
      <Text
        ref={ref as React.Ref<HTMLHeadingElement>}
        as={headingElement}
        variant="heading"
        size={headingSize}
        weight="bold"
        {...props}
      />
    );
  }
);

Heading.displayName = 'Heading';

// Paragraph component
const Paragraph = React.forwardRef<HTMLParagraphElement, ParagraphProps>(
  (props, ref) => (
    <Text
      ref={ref as React.Ref<HTMLParagraphElement>}
      as="p"
      variant="body"
      {...props}
    />
  )
);

Paragraph.displayName = 'Paragraph';

// VisuallyHidden component
const VisuallyHidden = React.forwardRef<HTMLSpanElement, VisuallyHiddenProps>(
  (props, ref) => (
    <Text
      ref={ref}
      as="span"
      srOnly
      {...props}
    />
  )
);

VisuallyHidden.displayName = 'VisuallyHidden';

// ============================================================================
// EXPORTS
// ============================================================================

export { Text, Heading, Paragraph, VisuallyHidden, textVariants };

// Export types that might be needed elsewhere
export type { 
  BaseTextProps,
  HeadingProps,
  ParagraphProps,
  VisuallyHiddenProps,
};