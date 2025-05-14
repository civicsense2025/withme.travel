import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Task Component Demo',
  description: 'An enhanced demonstration of the Task component with voting and status management',
};

export default function TaskDemoLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
