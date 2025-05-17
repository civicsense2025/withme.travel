import React from 'react';
import { cn } from '@/lib/utils';

export interface TripCardProps {
  id: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  imageSrc?: string;
  className?: string;
  onClick?: () => void;
}

export const TripCard: React.FC<TripCardProps> = ({
  id,
  title,
  description,
  startDate,
  endDate,
  imageSrc,
  className,
  onClick,
}) => {
  return (
    <div 
      className={cn('trip-card', className)}
      onClick={onClick}
    >
      {imageSrc && (
        <div className="trip-card-image">
          <img src={imageSrc} alt={title} />
        </div>
      )}
      <div className="trip-card-content">
        <h3 className="trip-card-title">{title}</h3>
        {description && <p className="trip-card-description">{description}</p>}
        {(startDate || endDate) && (
          <div className="trip-card-dates">
            {startDate && <span className="trip-card-start-date">{startDate}</span>}
            {startDate && endDate && <span className="trip-card-date-separator">-</span>}
            {endDate && <span className="trip-card-end-date">{endDate}</span>}
          </div>
        )}
      </div>
    </div>
  );
}; 