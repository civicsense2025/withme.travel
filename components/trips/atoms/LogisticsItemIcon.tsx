/**
 * LogisticsItemIcon
 * 
 * Icon component for different logistics item types
 * 
 * @module trips/atoms
 */

import React from 'react';
import { BedDouble, Car, FileText, Plane, Train, Bus } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface LogisticsItemIconProps {
  /** Type of logistics item */
  type: 'accommodation' | 'transportation' | 'form' | string;
  /** Transportation mode for transportation type */
  transportMode?: 'flight' | 'train' | 'car' | 'bus' | string;
  /** Optional CSS class name */
  className?: string;
  /** Icon size in pixels */
  size?: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function LogisticsItemIcon({
  type,
  transportMode = 'flight',
  className = '',
  size = 16,
}: LogisticsItemIconProps) {
  const iconProps = {
    className: cn('text-foreground/70', className),
    size: size,
  };

  switch (type) {
    case 'accommodation':
      return <BedDouble {...iconProps} />;
    case 'transportation':
      if (transportMode === 'flight') return <Plane {...iconProps} />;
      if (transportMode === 'train') return <Train {...iconProps} />;
      if (transportMode === 'car') return <Car {...iconProps} />;
      if (transportMode === 'bus') return <Bus {...iconProps} />;
      return <Car {...iconProps} />;
    case 'form':
      return <FileText {...iconProps} />;
    default:
      return <FileText {...iconProps} />;
  }
} 