'use client';

import { ReactNode } from 'react';

interface DashboardClientWrapperProps {
  children: ReactNode;
}

export function DashboardClientWrapper({ children }: DashboardClientWrapperProps) {
  // Simple wrapper component for client components in the dashboard
  // You can add error boundaries, suspense, or other client-side logic here
  return <>{children}</>;
}
