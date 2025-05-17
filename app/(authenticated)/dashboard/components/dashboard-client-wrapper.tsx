'use client';

import { ReactNode } from 'react';

interface DashboardClientWrapperProps {
  children: ReactNode;
  className?: string; // Allow className to be passed
}

export function DashboardClientWrapper({ children, className }: DashboardClientWrapperProps) {
  // Simple wrapper component for client components in the dashboard
  // You can add error boundaries, suspense, or other client-side logic here
  // Use a div instead of a Fragment to ensure className can be applied
  return <div className={className}>{children}</div>;
}
