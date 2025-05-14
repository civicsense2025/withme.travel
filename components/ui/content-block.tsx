import React from 'react';
import { cn } from '@/lib/utils';

export type ContentBlockVariant =
  | 'default' // Standard content block
  | 'card' // Card-like appearance with shadow
  | 'bordered' // With a border
  | 'highlight' // Highlighted with background color
  | 'glass'; // With glass effect

export type ContentBlockAlign =
  | 'left' // Left-aligned content
  | 'center' // Centered content
  | 'right'; // Right-aligned content

export type ContentBlockSize =
  | 'sm' // Small content block
  | 'md' // Medium content block
  | 'lg' // Large content block
  | 'auto'; // Size based on content

export interface ContentBlockProps {
  /** Variant determines the visual style of the content block */
  variant?: ContentBlockVariant;
  /** Text alignment within the content block */
  align?: ContentBlockAlign;
  /** Size of the content block */
  size?: ContentBlockSize;
  /** Whether to add a hover effect */
  hover?: boolean;
  /** Optional icon to display at the top of the content block */
  icon?: React.ReactNode;
  /** Optional image to display within the content block */
  image?: string;
  /** Optional image alt text when image is provided */
  imageAlt?: string;
  /** Whether the image should be at the top (default) or side */
  imagePlacement?: 'top' | 'side' | 'background';
  /** Optional heading for the content block */
  heading?: React.ReactNode;
  /** Optional subheading for the content block */
  subheading?: React.ReactNode;
  /** Main content of the block */
  children: React.ReactNode;
  /** Additional actions (buttons, links) */
  actions?: React.ReactNode;
  /** Additional class names */
  className?: string;
  /** Optional onClick handler for making the whole block clickable */
  onClick?: () => void;
  /** Optional href to make the block a link */
  href?: string;
  /** Optional aspect ratio for card-style blocks */
  aspectRatio?: '1:1' | '16:9' | '4:3' | '3:2' | 'auto';
}

/**
 * ContentBlock component for displaying structured content within sections.
 * Provides consistent styling for different types of content with various layouts.
 */
export function ContentBlock({
  variant = 'default',
  align = 'left',
  size = 'md',
  hover = false,
  icon,
  image,
  imageAlt = '',
  imagePlacement = 'top',
  heading,
  subheading,
  children,
  actions,
  className,
  onClick,
  href,
  aspectRatio = 'auto',
}: ContentBlockProps) {
  // Style mappings
  const variantStyles = {
    default: '',
    card: 'bg-card shadow-sm rounded-lg overflow-hidden',
    bordered: 'border rounded-lg overflow-hidden',
    highlight: 'bg-primary/5 dark:bg-primary/10 rounded-lg overflow-hidden',
    glass: 'bg-background/80 backdrop-blur-sm rounded-lg overflow-hidden shadow-sm',
  };

  const alignStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const sizeStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    auto: '',
  };

  const aspectRatioStyles = {
    '1:1': 'aspect-square',
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '3:2': 'aspect-[3/2]',
    auto: '',
  };

  // Generate base classes
  const blockClasses = cn(
    variantStyles[variant],
    alignStyles[align],
    size !== 'auto' && sizeStyles[size],
    hover && 'transition-all duration-200 hover:shadow-md',
    onClick && 'cursor-pointer',
    className
  );

  // Generate image component if provided
  const imageComponent = image && (
    <div
      className={cn(
        'overflow-hidden',
        imagePlacement === 'top' && aspectRatio !== 'auto' && aspectRatioStyles[aspectRatio],
        imagePlacement === 'side' && 'md:w-1/2',
        imagePlacement === 'background' && 'absolute inset-0 z-0'
      )}
    >
      <img
        src={image}
        alt={imageAlt}
        className={cn(
          'w-full h-full object-cover',
          imagePlacement === 'background' && 'opacity-20'
        )}
      />
    </div>
  );

  // Generate content component
  const contentComponent = (
    <div
      className={cn(
        'flex flex-col',
        imagePlacement === 'background' && 'relative z-10',
        imagePlacement === 'side' && 'md:w-1/2',
        imagePlacement === 'top' && image && 'mt-4',
        size !== 'auto' && sizeStyles[size]
      )}
    >
      {icon && (
        <div
          className={cn(
            'text-primary mb-4',
            align === 'center' && 'mx-auto',
            align === 'right' && 'ml-auto'
          )}
        >
          {icon}
        </div>
      )}

      {subheading && (
        <div className="text-sm font-medium text-primary uppercase tracking-wide mb-1">
          {subheading}
        </div>
      )}

      {heading &&
        (typeof heading === 'string' ? (
          <h3 className="text-xl font-medium mb-3">{heading}</h3>
        ) : (
          heading
        ))}

      <div className={cn('text-muted-foreground', heading ? 'mt-2' : '')}>{children}</div>

      {actions && (
        <div
          className={cn('mt-4', align === 'center' && 'mx-auto', align === 'right' && 'ml-auto')}
        >
          {actions}
        </div>
      )}
    </div>
  );

  // Render component with appropriate wrapper based on if it's clickable
  const content =
    imagePlacement === 'side' ? (
      <div className="md:flex md:items-center">
        {imageComponent}
        {contentComponent}
      </div>
    ) : (
      <>
        {imagePlacement === 'top' && imageComponent}
        {imagePlacement === 'background' && imageComponent}
        {contentComponent}
      </>
    );

  if (href) {
    return (
      <a href={href} className={blockClasses} onClick={onClick}>
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <div className={blockClasses} onClick={onClick} role="button" tabIndex={0}>
        {content}
      </div>
    );
  }

  return <div className={blockClasses}>{content}</div>;
}
