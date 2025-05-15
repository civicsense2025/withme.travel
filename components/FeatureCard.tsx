import React from 'react';
import { ThemeMode, getColorToken } from '@/utils/constants/design-system'; // Adjust path

interface FeatureCardProps {
  emoji: string;
  title: string;
  description: string;
  currentTheme: ThemeMode;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ emoji, title, description, currentTheme }) => {
  const textColor = getColorToken('TEXT', currentTheme);
  const mutedColor = getColorToken('MUTED', currentTheme);

  const cardStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '1.5rem', // Can be themed
  };
  const emojiStyle: React.CSSProperties = {
    fontSize: '2.2rem',
    margin: '0 auto 1rem auto',
  };
  const titleStyle: React.CSSProperties = {
    fontWeight: 700,
    marginBottom: '0.5rem',
    color: textColor,
  };
  const descriptionStyle: React.CSSProperties = {
    color: mutedColor,
  };

  return (
    <div style={cardStyle}>
      <div style={emojiStyle}>{emoji}</div>
      <h3 style={titleStyle}>{title}</h3>
      <p style={descriptionStyle}>{description}</p>
    </div>
  );
}; 