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

// Responsive style for extra large vertical spacing in rems
const headerStyle: React.CSSProperties = {
  width: '100%',
  paddingTop: '5rem', // 80px
  paddingBottom: '5rem',
};

// Add a media query for md+ screens (min-width: 768px)
const mdHeaderStyle: React.CSSProperties = {
  paddingTop: '4rem', // 120px
  paddingBottom: '4rem',
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
      if (window.innerWidth >= 768) {
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
          'space-y-4',
          centered && 'flex flex-col items-center',
          actions
            ? 'md:flex md:flex-row md:items-center md:justify-between md:space-y-0'
            : undefined
        )}
      >
        <div className={cn('space-y-4', centered && 'flex flex-col items-center')}>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight">
            {displayTitle}
          </h1>
          {description && (
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">{description}</p>
          )}
          {children && (
            <div className="text-lg md:text-xl text-muted-foreground max-w-2xl">{children}</div>
          )}
        </div>

        {actions && (
          <div
            className={cn(
              'mt-6 md:mt-0',
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
