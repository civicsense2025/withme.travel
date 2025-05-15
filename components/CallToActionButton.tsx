import React from 'react';
import { motion } from 'framer-motion';
import { LayoutType } from '@/utils/constants/groupCirclesConstants'; // Adjust path

interface CallToActionButtonProps {
  layout: LayoutType;
  onClick: () => void;
  buttonText: string;
  // Potentially pass colors as props for theming
}

export const CallToActionButton: React.FC<CallToActionButtonProps> = ({ layout, onClick, buttonText }) => {
  const primaryButtonColor = '#7c83fd'; // Theme this
  const primaryButtonTextColor = 'white'; // Theme this

  const buttonStyle: React.CSSProperties = {
    backgroundColor: primaryButtonColor,
    color: primaryButtonTextColor,
    border: 'none',
    padding: layout === 'mobile' ? '0.75rem 1.5rem' : '1rem 2rem',
    borderRadius: '3rem',
    fontWeight: 600,
    fontSize: layout === 'mobile' ? '1rem' : '1.125rem',
    cursor: 'pointer',
    boxShadow: `0 4px 12px rgba(124,131,253,0.13)`, // Use themed color
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05, boxShadow: `0 10px 20px rgba(124,131,253,0.18)` }} // Use themed color
      whileTap={{ scale: 0.98 }}
      style={buttonStyle}
      onClick={onClick}
    >
      {buttonText}
    </motion.button>
  );
}; 