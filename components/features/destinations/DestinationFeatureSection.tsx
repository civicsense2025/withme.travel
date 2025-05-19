import React from 'react';
import Link from 'next/link';
import { Section } from '@/components/ui/Section';
import { ContentBlock } from '@/components/ui/ContentBlock';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface DestinationFeature {
  title: string;
  description: string;
  image?: string;
  icon?: React.ReactNode;
  link?: {
    text: string;
    href: string;
  };
}

export interface DestinationFeatureSectionProps {
  /** Section title */
  title: string;
  /** Optional section description */
  description?: string;
  /** Array of features to display */
  features: DestinationFeature[];
  /** Visual style variant */
  variant?: 'default' | 'cards' | 'alternating' | 'compact' | 'grid';
  /** Background style */
  background?: 'none' | 'light' | 'dark' | 'gradient' | 'image';
  /** Background image URL if background is 'image' */
  backgroundImage?: string;
  /** Whether to use glass effect on content blocks */
  glass?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Call to action button */
  cta?: {
    text: string;
    href: string;
  };
}

/**
 * A specialized section for displaying destination features in various layouts.
 * Leverages the Section and ContentBlock components for consistent styling.
 */
export function DestinationFeatureSection({
  title,
  description,
  features,
  variant = 'default',
  background = 'none',
  backgroundImage,
  glass = false,
  className,
  cta,
}: DestinationFeatureSectionProps) {
  // Determine layout based on variant
  const sectionLayout =
    variant === 'grid'
      ? 'grid'
      : variant === 'alternating'
        ? 'standard'
        : variant === 'compact'
          ? 'standard'
          : 'standard';

  const sectionVariant = variant === 'compact' ? 'compact' : 'default';

  // Generate actions for section if CTA is provided
  const actions = cta ? (
    <Link href={cta.href}>
      <Button>{cta.text}</Button>
    </Link>
  ) : undefined;

  return (
    <Section
      heading={title}
      description={description}
      variant={sectionVariant}
      layout={sectionLayout}
      background={background}
      backgroundImage={backgroundImage}
      glass={glass}
      columns={3}
      className={className}
      actions={actions}
    >
      {variant === 'grid' ? (
        // Grid layout - all features in a grid
        <>
          {features.map((feature, index) => (
            <ContentBlock
              key={index}
              variant={glass ? 'glass' : 'card'}
              heading={feature.title}
              icon={feature.icon}
              image={feature.image}
              imageAlt={feature.title}
              aspectRatio={feature.image ? '16:9' : undefined}
              hover={!!feature.link}
              href={feature.link?.href}
            >
              <p>{feature.description}</p>
            </ContentBlock>
          ))}
        </>
      ) : variant === 'cards' ? (
        // Cards layout - all features as cards
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <ContentBlock
              key={index}
              variant="card"
              heading={feature.title}
              icon={feature.icon}
              image={feature.image}
              imageAlt={feature.title}
              aspectRatio={feature.image ? '16:9' : undefined}
              hover={!!feature.link}
              actions={
                feature.link ? (
                  <Link href={feature.link.href}>
                    <Button size="sm">{feature.link.text}</Button>
                  </Link>
                ) : undefined
              }
            >
              <p>{feature.description}</p>
            </ContentBlock>
          ))}
        </div>
      ) : variant === 'alternating' ? (
        // Alternating layout - features alternate sides
        <div className="space-y-16">
          {features.map((feature, index) => (
            <ContentBlock
              key={index}
              variant={glass ? 'glass' : 'default'}
              imagePlacement="side"
              image={feature.image}
              imageAlt={feature.title}
              heading={feature.title}
              icon={feature.icon}
              actions={
                feature.link ? (
                  <Link href={feature.link.href}>
                    <Button size="sm">{feature.link.text}</Button>
                  </Link>
                ) : undefined
              }
              className={index % 2 === 1 ? 'flex-row-reverse' : ''}
            >
              <p>{feature.description}</p>
            </ContentBlock>
          ))}
        </div>
      ) : variant === 'compact' ? (
        // Compact layout - condensed list of features
        <div className="space-y-4">
          {features.map((feature, index) => (
            <ContentBlock
              key={index}
              variant="bordered"
              size="sm"
              heading={feature.title}
              icon={feature.icon}
              actions={
                feature.link ? (
                  <Link href={feature.link.href}>
                    <Button size="sm" variant="link">
                      {feature.link.text}
                    </Button>
                  </Link>
                ) : undefined
              }
            >
              <p>{feature.description}</p>
            </ContentBlock>
          ))}
        </div>
      ) : (
        // Default layout - stacked features with images if available
        <div className="space-y-12">
          {features.map((feature, index) => (
            <ContentBlock
              key={index}
              variant={glass ? 'glass' : 'default'}
              image={feature.image}
              imageAlt={feature.title}
              imagePlacement={feature.image ? 'side' : undefined}
              heading={feature.title}
              icon={feature.icon}
              actions={
                feature.link ? (
                  <Link href={feature.link.href}>
                    <Button size="sm">{feature.link.text}</Button>
                  </Link>
                ) : undefined
              }
            >
              <p>{feature.description}</p>
            </ContentBlock>
          ))}
        </div>
      )}
    </Section>
  );
}
