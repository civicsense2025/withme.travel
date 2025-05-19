import React from 'react';
import { MapPinIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MapMarkerProps {
  /** Label for the marker */
  label?: string;
  /** Whether the marker is selected */
  isSelected?: boolean;
  /** Whether the marker is highlighted */
  isHighlighted?: boolean;
  /** Marker color scheme */
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'success';
  /** Optional additional className */
  className?: string;
  /** Callback when marker is clicked */
  onClick?: () => void;
  /** Whether to show the label */
  showLabel?: boolean;
  /** Optional custom icon */
  icon?: React.ReactNode;
}

export function MapMarker({
  label,
  isSelected = false,
  isHighlighted = false,
  variant = 'default',
  className,
  onClick,
  showLabel = false,
  icon,
}: MapMarkerProps) {
  // Define styles based on variant and state
  const getMarkerStyles = () => {
    const baseStyles = 'transition-all duration-200 transform cursor-pointer';
    const variantStyles = {
      default: 'text-slate-800 dark:text-slate-200',
      primary: 'text-primary',
      secondary: 'text-secondary',
      danger: 'text-destructive',
      success: 'text-green-600 dark:text-green-500',
    };
    
    const selectedStyles = isSelected ? 'scale-125 z-10' : '';
    const highlightStyles = isHighlighted ? 'animate-pulse' : '';
    
    return cn(
      baseStyles,
      variantStyles[variant],
      selectedStyles,
      highlightStyles,
      className
    );
  };

  return (
    <div className={getMarkerStyles()} onClick={onClick}>
      <div className="relative flex flex-col items-center">
        {/* Marker Icon */}
        <div className="relative">
          {icon || <MapPinIcon className="h-6 w-6" />}
          
          {/* Selection ring */}
          {isSelected && (
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/50" />
          )}
        </div>
        
        {/* Label */}
        {showLabel && label && (
          <span className="mt-1 text-xs font-medium px-1.5 py-0.5 bg-background/80 backdrop-blur-sm rounded">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}