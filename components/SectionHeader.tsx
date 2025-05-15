import React from 'react';
import { LayoutType } from '@/utils/constants/groupCirclesConstants'; // Adjust path

interface SectionHeaderProps {
  title: React.ReactNode; // Allow for embedding spans like the sparkle emoji
  subtitle: string;
  layout: LayoutType;
  textColor: string;
  mutedColor: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, layout, textColor, mutedColor }) => {
  const headerStyles: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: layout === 'mobile' ? '1.5rem' : '3rem',
    position: 'relative',
    zIndex: 1,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: layout === 'mobile' ? '1.5rem' : '2.5rem',
    fontWeight: 700,
    marginBottom: '0.5rem',
    color: textColor,
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: layout === 'mobile' ? '1rem' : '1.25rem',
    color: mutedColor,
    maxWidth: 600,
    margin: '0 auto',
  };

  return (
    <div style={headerStyles}>
      <h2 style={titleStyles}>{title}</h2>
      <p style={subtitleStyles}>{subtitle}</p>
    </div>
  );
}; 