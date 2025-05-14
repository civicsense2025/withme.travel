import React from 'react';

export interface HeroBannerProps {
  imageUrl: string;
  title: string;
  subtitle?: string;
  meta?: React.ReactNode;
}

/**
 * HeroBanner displays a large hero image with overlayed title, subtitle, and meta info.
 * @example <HeroBanner imageUrl="/img.jpg" title="Trip Title" subtitle="Location" meta={<span>5 days</span>} />
 */
export function HeroBanner({ imageUrl, title, subtitle, meta }: HeroBannerProps) {
  return (
    <div className="relative w-full h-64 md:h-80 rounded-3xl overflow-hidden shadow-lg mb-6">
      <img
        src={imageUrl}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ filter: 'brightness(0.7)' }}
      />
      <div className="relative z-10 flex flex-col justify-center h-full px-8 py-6">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">{title}</h1>
        {subtitle && (
          <div className="text-lg md:text-2xl text-white mb-2 drop-shadow">{subtitle}</div>
        )}
        {meta && (
          <div className="flex items-center gap-4 text-white text-base drop-shadow">{meta}</div>
        )}
      </div>
    </div>
  );
}

export default HeroBanner;
