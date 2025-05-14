// app/groups/[id]/plans/[slug]/layout.tsx
import { cn } from '@/lib/utils';

export default function PlanWhiteboardLayout({ children }: { children: React.ReactNode }) {
  // This custom layout doesn't include the main navigation bar
  // It creates a full-screen experience for the whiteboard
  return (
    <div className={cn('min-h-screen w-full flex flex-col overflow-hidden', 'fullscreen-layout')}>
      {/* Full-screen container without the main nav */}
      <div className="flex-1 flex flex-col w-full">{children}</div>
    </div>
  );
}
