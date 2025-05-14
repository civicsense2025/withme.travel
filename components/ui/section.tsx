import React from 'react';
import { cn } from '@/lib/utils';
import { Container } from '@/components/container';

export type SectionVariant =
  | 'default' // Standard section with regular padding
  | 'hero' // Large padding, typically for page heroes
  | 'compact' // Less padding for denser sections
  | 'featurette' // Medium padding with specific styling for feature highlights
  | 'accent' // With a subtle background color
  | 'divider'; // Includes a divider at the bottom

export type SectionSize = 'sm' | 'md' | 'lg' | 'xl' | 'wide' | 'full';

export type SectionLayout =
  | 'standard' // Standard stacked layout
  | 'split' // Side-by-side content (for responsive layouts)
  | 'grid' // Grid-based layout for cards and items
  | 'overlap' // Overlapping elements
  | 'centered'; // Content centered horizontally and vertically

export type SectionBackground =
  | 'none' // No background
  | 'light' // Light background
  | 'dark' // Dark background
  | 'primary' // Primary color background
  | 'secondary' // Secondary color background
  | 'accent' // Accent color background
  | 'gradient' // Gradient background
  | 'image'; // Background image (requires backgroundImage prop)

export interface SectionProps {
  /** ID for the section, useful for navigation/analytics */
  id?: string;
  /** Section variant that controls padding and overall appearance */
  variant?: SectionVariant;
  /** Container size for the section's content */
  size?: SectionSize;
  /** Layout pattern for the section */
  layout?: SectionLayout;
  /** Background style of the section */
  background?: SectionBackground;
  /** URL for background image, when background is 'image' */
  backgroundImage?: string;
  /** Optional custom styles for background image */
  backgroundImageStyle?: React.CSSProperties;
  /** Whether to add a glass effect to the section */
  glass?: boolean;
  /** Whether the content should have a max-width */
  constrainContent?: boolean;
  /** Content of the section */
  children: React.ReactNode;
  /** Optional top-level heading for the section */
  heading?: React.ReactNode;
  /** Optional description text for the section */
  description?: React.ReactNode;
  /** Additional class names to apply to the section */
  className?: string;
  /** Optional actions for the section (buttons, links, etc.) */
  actions?: React.ReactNode;
  /** Column count for grid layout */
  columns?: 1 | 2 | 3 | 4;
}

/**
 * Section component that provides consistent layout sections with various styling options
 * for building responsive page layouts. Supports different backgrounds, layouts, and sizing.
 */
export function Section({
  id,
  variant = 'default',
  size = 'md',
  layout = 'standard',
  background = 'none',
  backgroundImage,
  backgroundImageStyle,
  glass = false,
  constrainContent = true,
  children,
  heading,
  description,
  className,
  actions,
  columns = 3,
}: SectionProps) {
  // Style mappings
  const variantStyles = {
    default: 'py-12 md:py-16',
    hero: 'py-16 md:py-24 lg:py-32',
    compact: 'py-8 md:py-10',
    featurette: 'py-12 md:py-20',
    accent: 'py-12 md:py-20 bg-muted/30',
    divider: 'py-12 md:py-16 border-b',
  };

  const backgroundStyles = {
    none: '',
    light: 'bg-background/50',
    dark: 'bg-gray-900 text-white',
    primary: 'bg-primary/10 dark:bg-primary/20',
    secondary: 'bg-secondary/10 dark:bg-secondary/20',
    accent: 'bg-accent/10 dark:bg-accent/20',
    gradient:
      'bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10',
    image: 'bg-cover bg-center bg-no-repeat text-white', // Background image set via inline style
  };

  const layoutStyles = {
    standard: '',
    split: 'md:grid md:grid-cols-2 md:gap-12 items-center',
    grid: `grid grid-cols-1 sm:grid-cols-2 ${
      columns === 3
        ? 'md:grid-cols-3'
        : columns === 4
          ? 'md:grid-cols-2 lg:grid-cols-4'
          : 'md:grid-cols-2'
    } gap-6 md:gap-8`,
    overlap: 'relative',
    centered: 'flex flex-col items-center justify-center text-center',
  };

  // Generate background style for image background
  const bgStyle: React.CSSProperties = {};
  if (background === 'image' && backgroundImage) {
    bgStyle.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.4)), url(${backgroundImage})`;
    if (backgroundImageStyle) {
      Object.assign(bgStyle, backgroundImageStyle);
    }
  }

  // Generate heading and description layout
  const headerContent = (heading || description) && (
    <div
      className={cn(
        'mb-10',
        layout === 'centered' && 'text-center mx-auto max-w-3xl',
        layout === 'split' && 'mb-0'
      )}
    >
      {heading &&
        (typeof heading === 'string' ? (
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-4">{heading}</h2>
        ) : (
          heading
        ))}
      {description &&
        (typeof description === 'string' ? (
          <p className="text-lg text-muted-foreground max-w-3xl">{description}</p>
        ) : (
          description
        ))}
      {actions && (
        <div className={cn('mt-6', layout === 'centered' && 'flex justify-center space-x-4')}>
          {actions}
        </div>
      )}
    </div>
  );

  return (
    <section
      id={id}
      className={cn(
        variantStyles[variant],
        backgroundStyles[background],
        glass && 'backdrop-blur-sm',
        className
      )}
      style={bgStyle}
    >
      <Container size={size} glass={glass && background !== 'none'}>
        {layout === 'split' ? (
          <div className={layoutStyles.split}>
            {headerContent}
            <div>{children}</div>
          </div>
        ) : (
          <>
            {headerContent}
            <div
              className={cn(
                layout !== 'standard' && layoutStyles[layout],
                constrainContent && layout === 'standard' && 'max-w-prose mx-auto'
              )}
            >
              {children}
            </div>
          </>
        )}
      </Container>
    </section>
  );
}
