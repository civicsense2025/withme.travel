'use client';

import React, { ReactNode } from 'react';

export interface UserResearchHeroProps {
  /**
   * The main headline displayed in the hero section
   */
  headline: string;
  
  /**
   * The subheadline text displayed below the headline
   */
  subheadline: string;
  
  /**
   * Whether to show the animated background shapes
   * @default true
   */
  showBackgroundAnimation?: boolean;
  
  /**
   * Additional children to render in the hero content area
   */
  children?: ReactNode;
  
  /**
   * Additional CSS class names
   */
  className?: string;
}

/**
 * Hero component for user research and testing pages (no header)
 */
export function UserResearchHero({
  headline,
  subheadline,
  showBackgroundAnimation = true,
  children,
  className = '',
}: UserResearchHeroProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Animated background elements */}
      {showBackgroundAnimation && (
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-primary/20 dark:bg-primary/10 rounded-full blur-3xl opacity-60 animate-float" />
          <div className="absolute bottom-[-120px] right-[-80px] w-[500px] h-[500px] bg-accent/20 dark:bg-accent/10 rounded-full blur-3xl opacity-50 animate-float-slow" />
        </div>
      )}

      {/* Hero content */}
      <div className="flex-1 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-lg mx-auto flex flex-col items-center py-16">
          <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-5 text-foreground tracking-tight">
            {headline}
          </h1>
          <p className="text-md md:text-lg text-center text-muted-foreground mb-10 max-w-md">
            {subheadline}
          </p>
          {children}
        </div>
      </div>

      {/* Animations styles */}
      <style jsx global>{`
        .animate-float {
          animation: float 10s ease-in-out infinite alternate;
        }
        .animate-float-slow {
          animation: float 16s ease-in-out infinite alternate;
        }
        @keyframes float {
          0% {
            transform: translateY(0) scale(1);
          }
          100% {
            transform: translateY(-30px) scale(1.05);
          }
        }
        .animate-subtle-glow {
          box-shadow:
            0 0 12px 2px var(--color-primary-glow, rgba(233,216,253,0.4)),
            0 0 20px 5px var(--color-accent-glow, rgba(251,191,36,0.2));
          animation: subtleGlowPulse 3s infinite alternate;
        }
        @keyframes subtleGlowPulse {
          0% {
            box-shadow:
              0 0 12px 2px var(--color-primary-glow, rgba(233,216,253,0.3)),
              0 0 20px 5px var(--color-accent-glow, rgba(251,191,36,0.15));
          }
          100% {
            box-shadow:
              0 0 20px 4px var(--color-primary-glow, rgba(233,216,253,0.4)),
              0 0 28px 8px var(--color-accent-glow, rgba(251,191,36,0.2));
          }
        }
      `}</style>
    </div>
  );
} 