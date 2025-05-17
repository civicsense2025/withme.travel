'use client';

import { cn } from '@/lib/utils';
import { TripCoverImage } from '../atoms/TripCoverImage';
import { TripDestinationBadge } from '../atoms/TripDestinationBadge';
import { TripDates } from '../atoms/TripDates';

/**
 * Props for the TripCreationForm component
 */
export interface TripCreationFormProps {
  /** Initial trip name */
  initialName?: string;
  /** Initial destination */
  initialDestination?: string;
  /** Initial start date (ISO) */
  initialStartDate?: string;
  /** Initial end date (ISO) */
  initialEndDate?: string;
  /** Initial cover image URL */
  initialCoverImageUrl?: string | null;
  /** Submit handler */
  onSubmit: (data: {
    name: string;
    destination: string;
    startDate: string;
    endDate: string;
    coverImageUrl?: string | null;
  }) => void;
  /** Cancel handler */
  onCancel?: () => void;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Organism: Form for creating or editing a trip
 */
export function TripCreationForm({
  initialName = '',
  initialDestination = '',
  initialStartDate = '',
  initialEndDate = '',
  initialCoverImageUrl = null,
  onSubmit,
  onCancel,
  className,
}: TripCreationFormProps) {
  // ...form state and handlers here (scaffold only)...
  return (
    <form className={cn('p-6 bg-white dark:bg-gray-950 rounded-xl shadow-md space-y-4', className)}>
      {/* Cover image preview */}
      <TripCoverImage src={initialCoverImageUrl} alt="Trip cover" aspectRatio="16:9" className="mb-2" />
      {/* Name, destination, dates fields (scaffolded) */}
      <div>Name: {initialName}</div>
      <div>Destination: {initialDestination}</div>
      <div>Dates: <TripDates startDate={initialStartDate} endDate={initialEndDate} /></div>
      {/* Actions */}
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary">Save</button>
        {onCancel && <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
} 