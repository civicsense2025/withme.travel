/**
 * Card (Molecule)
 *
 * A themeable, accessible card component with variants, hover effects,
 * and optional clickable behavior.
 *
 * @module ui/molecules
 */
import React from 'react';
import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

export type CardVariant = 'default' | 'outlined' | 'elevated' | 'flat';
export type CardPadding = 'default' | 'tight' | 'loose' | 'none';

/**
 * Props for the Card component
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual variant of the card */
  variant?: CardVariant;
  /** Whether the card is clickable */
  clickable?: boolean;
  /** Whether to show hover effects */
  hoverable?: boolean;
  /** Callback when card is clicked */
  onCardClick?: () => void;
  /** Horizontal padding size */
  padding?: CardPadding;
  /** Whether to display a border */
  withBorder?: boolean;
}

const paddingMap: Record<CardPadding, string> = {
  default: '',
  tight: 'p-2',
  loose: 'p-6',
  none: 'p-0'
};

/**
 * Card container component
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant = 'default',
    clickable = false,
    hoverable = false, 
    onCardClick,
    padding = 'default',
    withBorder = true,
    children,
    onClick,
    ...props 
  }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      onClick?.(e);
      if (!e.defaultPrevented && onCardClick) {
        onCardClick();
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg bg-background',
          {
            'border': withBorder && (variant === 'default' || variant === 'outlined'),
            'shadow-sm': variant === 'default',
            'shadow-md': variant === 'elevated',
            'hover:shadow-md transition-shadow duration-200': hoverable,
            'cursor-pointer': clickable || onCardClick,
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2': 
              clickable || onCardClick,
          },
          paddingMap[padding] !== 'p-0' ? paddingMap[padding] : '',
          className
        )}
        onClick={clickable || onCardClick ? handleClick : undefined}
        tabIndex={clickable || onCardClick ? 0 : undefined}
        role={clickable || onCardClick ? 'button' : undefined}
        onKeyDown={
          (clickable || onCardClick) 
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onCardClick?.();
                }
              }
            : undefined
        }
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

/**
 * Props for the CardHeader component
 */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether to show a border below the header */
  withBorder?: boolean;
  /** Alignment of header content */
  align?: 'left' | 'center' | 'right';
}

/**
 * Card header section component
 */
export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, withBorder = true, align = 'left', ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn(
        'p-4', 
        withBorder && 'border-b',
        {
          'text-left': align === 'left',
          'text-center': align === 'center',
          'text-right': align === 'right',
        },
        className
      )} 
      {...props} 
    />
  )
);
CardHeader.displayName = 'CardHeader';

/**
 * Props for the CardContent component
 */
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Custom padding */
  padding?: CardPadding;
}

/**
 * Card content container component
 */
export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, padding = 'default', ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn(
        padding === 'default' ? 'p-4' : paddingMap[padding],
        className
      )} 
      {...props} 
    />
  )
);
CardContent.displayName = 'CardContent';

/**
 * Props for the CardFooter component
 */
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether to show a border above the footer */
  withBorder?: boolean;
  /** Alignment of footer content */
  align?: 'left' | 'center' | 'right' | 'between';
}

/**
 * Card footer component
 */
export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, withBorder = true, align = 'left', ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn(
        'p-4', 
        withBorder && 'border-t',
        {
          'text-left': align === 'left',
          'text-center': align === 'center',
          'text-right': align === 'right',
          'flex justify-between items-center': align === 'between',
        },
        className
      )} 
      {...props} 
    />
  )
);
CardFooter.displayName = 'CardFooter';

/**
 * Props for the CardTitle component
 */
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** HTML element to render as */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

/**
 * Card title component
 */
export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Component = 'h3', ...props }, ref) => {
    const Heading = Component;
    return (
      <Heading 
        ref={ref} 
        className={cn('text-lg font-semibold', className)} 
        {...props} 
      />
    );
  }
);
CardTitle.displayName = 'CardTitle';

/**
 * Card description component
 */
export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

/**
 * Card image component
 */
export interface CardImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Whether to add rounded corners to the image */
  rounded?: boolean;
  /** Image aspect ratio */
  aspectRatio?: '16/9' | '4/3' | '1/1' | '2/3' | '3/2';
  /** Position relative to card */
  position?: 'top' | 'bottom';
}

export const CardImage = React.forwardRef<HTMLImageElement, CardImageProps>(
  ({ className, rounded = true, aspectRatio = '16/9', position = 'top', alt = '', ...props }, ref) => {
    const imageClass = cn(
      'w-full object-cover',
      position === 'top' ? 'rounded-t-lg' : 'rounded-b-lg',
      {
        'aspect-video': aspectRatio === '16/9',
        'aspect-4/3': aspectRatio === '4/3',
        'aspect-square': aspectRatio === '1/1',
        'aspect-2/3': aspectRatio === '2/3',
        'aspect-3/2': aspectRatio === '3/2',
      },
      className
    );

    return <img ref={ref} className={imageClass} alt={alt} {...props} />;
  }
);
CardImage.displayName = 'CardImage';