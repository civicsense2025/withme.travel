'use client';
import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title?: string;
  heading?: string; // For backward compatibility
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  centered?: boolean;
  children?: React.ReactNode; // For backward compatibility
}

// Responsive style for spacing in rems - reduced for mobile
const headerStyle: React.CSSProperties = {
  width: '100%',
  paddingTop: '2.5rem', // 40px - reduced for mobile
  paddingBottom: '2.5rem', // 40px - reduced for mobile
};

// Add a media query for md+ screens (min-width: 768px)
const mdHeaderStyle: React.CSSProperties = {
  paddingTop: '4rem', // 64px for medium screens
  paddingBottom: '4rem',
};

// Add a media query for lg+ screens (min-width: 1024px)
const lgHeaderStyle: React.CSSProperties = {
  paddingTop: '5rem', // 80px for large screens
  paddingBottom: '5rem',
};

export function PageHeader({
  title,
  heading,
  description,
  actions,
  className,
  centered = false,
  children,
}: PageHeaderProps) {
  // For backward compatibility - use heading if title is not provided
  const displayTitle = title || heading || '';

  // Inline style with media query for rem-based spacing
  const [style, setStyle] = React.useState<React.CSSProperties>(headerStyle);
  React.useEffect(() => {
    const updateStyle = () => {
      if (window.innerWidth >= 1024) {
        setStyle({ ...headerStyle, ...mdHeaderStyle, ...lgHeaderStyle });
      } else if (window.innerWidth >= 768) {
        setStyle({ ...headerStyle, ...mdHeaderStyle });
      } else {
        setStyle(headerStyle);
      }
    };
    updateStyle();
    window.addEventListener('resize', updateStyle);
    return () => window.removeEventListener('resize', updateStyle);
  }, []);

  return (
    <div className={cn(centered ? 'text-center' : 'text-left', className)} style={style}>
      <div
        className={cn(
          'space-y-3 md:space-y-4', // Reduced vertical spacing on mobile
          centered && 'flex flex-col items-center',
          actions
            ? 'md:flex md:flex-row md:items-center md:justify-between md:space-y-0'
            : undefined
        )}
      >
        <div className={cn('space-y-3 md:space-y-4', centered && 'flex flex-col items-center')}>
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-medium tracking-tight">
            {displayTitle}
          </h1>
          {description && (
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl">{description}</p>
          )}
          {children && (
            <div className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl">{children}</div>
          )}
        </div>

        {actions && (
          <div
            className={cn(
              'mt-4 md:mt-0', // Reduced top margin on mobile
              centered ? 'flex justify-center' : 'flex justify-start md:justify-end'
            )}
          >
            {actions}
          </div>
        )}
      </div>
    </div>
  );
} 