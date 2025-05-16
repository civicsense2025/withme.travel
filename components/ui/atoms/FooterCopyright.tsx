import React from 'react';

export function FooterCopyright() {
  return (
    <p className="text-xs text-muted-foreground lowercase">
      © {new Date().getFullYear()} withme.travel. All rights reserved.
    </p>
  );
}
