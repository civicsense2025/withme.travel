/**
 * Collapsible UI Component
 *
 * Provides a collapsible/expandable section for UI content.
 * @module components/ui/Collapsible
 */

import React, { useState } from 'react';

/**
 * Collapsible component props
 */
export interface CollapsibleProps {
  /** Section title */
  title: string;
  /** Content to show/hide */
  children: React.ReactNode;
  /** Whether the section is open by default */
  defaultOpen?: boolean;
  /** Additional className for styling */
  className?: string;
}

/**
 * Collapsible UI component (placeholder)
 */
export function Collapsible({ title, children, defaultOpen = false, className }: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);
  // TODO: Implement collapsible UI
  return (
    <section className={className}>
      <button type="button" onClick={() => setOpen((v) => !v)} style={{ fontWeight: 'bold', marginBottom: 8 }}>
        {open ? '▼' : '▶'} {title}
      </button>
      {open && <div>{children}</div>}
    </section>
  );
}

export default Collapsible; 