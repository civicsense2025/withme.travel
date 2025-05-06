   // app/groups/[id]/plans/[slug]/layout.tsx
   export default function PlanWhiteboardLayout({ children }: { children: React.ReactNode }) {
    // This custom layout doesn't include the main navigation bar
    // It creates a full-screen experience for the whiteboard
    return (
      <div className="min-h-screen flex flex-col">
        {/* Full-screen container without the main nav */}
        <div className="flex-1 flex flex-col">
          {children}
        </div>
      </div>
    );
  }