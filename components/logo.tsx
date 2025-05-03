import React from 'react';

interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      <span className="text-xl font-bold gradient-text">🤝 withme.travel</span>
    </span>
  );
}
