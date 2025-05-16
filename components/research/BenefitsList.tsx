'use client';

import React from 'react';

export interface Benefit {
  /**
   * Emoji to display as the icon
   */
  emoji: string;
  
  /**
   * Benefit text to display
   */
  text: string;
}

export interface BenefitsListProps {
  /**
   * Array of benefits to display
   */
  benefits: Benefit[];
  
  /**
   * Optional heading text for the benefits section
   */
  heading?: string;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Card style appearance
   * @default true
   */
  cardStyle?: boolean;
}

/**
 * Component for displaying a list of benefits with emoji icons
 */
export function BenefitsList({
  benefits,
  heading = 'When you join, you\'ll get:',
  className = '',
  cardStyle = true,
}: BenefitsListProps) {
  if (!benefits || benefits.length === 0) return null;
  
  return (
    <div className={`w-full max-w-sm mx-auto ${className}`}>
      {heading && (
        <h3 className="text-base font-semibold mb-4 text-foreground">
          {heading}
        </h3>
      )}
      
      <ul className="mb-8 w-full text-foreground text-base space-y-4">
        {benefits.map((benefit) => (
          <li
            key={benefit.text}
            className={`flex items-start gap-3 ${
              cardStyle 
                ? 'bg-card border border-border p-3 rounded-xl' 
                : ''
            }`}
          >
            <span className="text-xl flex-shrink-0 mt-0.5" role="img" aria-hidden="true">
              {benefit.emoji}
            </span>
            <span>{benefit.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
} 