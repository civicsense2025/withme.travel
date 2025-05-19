/**
 * GroupPlanCard Molecule
 *
 * Displays a group plan summary card.
 * @module components/features/groups/molecules/GroupPlanCard
 */

import React from 'react';

/**
 * GroupPlanCard component props
 */
export interface GroupPlanCardProps {
  /** Plan title */
  title: string;
  /** Plan description */
  description?: string;
  /** Optional image URL */
  imageUrl?: string;
  /** Click handler */
  onClick?: () => void;
  /** Additional className for styling */
  className?: string;
}

/**
 * GroupPlanCard molecule for group plans (placeholder)
 */
export function GroupPlanCard({ title, description, imageUrl, onClick, className }: GroupPlanCardProps) {
  // TODO: Implement plan card UI
  return (
    <div className={className} onClick={onClick} style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, cursor: onClick ? 'pointer' : 'default' }}>
      {imageUrl && <img src={imageUrl} alt={title} style={{ width: '100%', borderRadius: 4, marginBottom: 8 }} />}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  );
}

export default GroupPlanCard; 