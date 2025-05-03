import type { ReactNode } from 'react';

interface PageHeaderProps {
  heading: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({ heading, description, children, className }: PageHeaderProps) {
  return (
    <div
      className={`flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0 pb-5 ${className}`}
    >
      <div>
        <h1 className="text-5xl leading-loose font-bold tracking-tight lowercase">{heading}</h1>
        {description && <p className="text-muted-foreground lowercase">{description}</p>}
      </div>
      {children}
    </div>
  );
}
