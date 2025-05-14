'use client';

import React from 'react';
import { Info } from 'lucide-react';

interface ImageDebugProps {
  src?: string;
  width?: number;
  height?: number;
  alt?: string;
  sizes?: string;
  quality?: number;
  priority?: boolean;
  className?: string;
}

/**
 * ImageDebug - A component to help debug image rendering issues
 * Shows details about the image props and rendering status
 */
export function ImageDebug({
  src,
  width,
  height,
  alt,
  sizes,
  quality,
  priority,
  className,
}: ImageDebugProps) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-xs">
      <div className="grid grid-cols-2 gap-1">
        <span className="font-semibold">src:</span>
        <span>{src || 'undefined'}</span>

        <span className="font-semibold">width:</span>
        <span>{width || 'undefined'}</span>

        <span className="font-semibold">height:</span>
        <span>{height || 'undefined'}</span>

        <span className="font-semibold">alt:</span>
        <span className="truncate">{alt || 'undefined'}</span>

        <span className="font-semibold">sizes:</span>
        <span className="truncate">{sizes || 'undefined'}</span>

        <span className="font-semibold">quality:</span>
        <span>{quality || 'undefined'}</span>

        <span className="font-semibold">priority:</span>
        <span>{priority ? 'true' : 'false'}</span>
      </div>
    </div>
  );
}
