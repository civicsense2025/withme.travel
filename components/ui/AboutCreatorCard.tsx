import React from 'react';

export interface AboutCreatorCardProps {
  name: string;
  avatarUrl?: string;
  tagline?: string;
  description: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
}

/**
 * AboutCreatorCard displays info about the creator of an itinerary or guide.
 * @example <AboutCreatorCard name="Local Travel Expert" description="Creates personalized experiences..." />
 */
export function AboutCreatorCard({
  name,
  avatarUrl,
  tagline,
  description,
  ctaLabel = 'Support Creator',
  onCtaClick,
}: AboutCreatorCardProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow flex flex-col gap-3 min-w-[260px]">
      <h2 className="font-bold text-xl mb-1">About the Creator</h2>
      <div className="flex items-center gap-3 mb-2">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <span
            className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-2xl"
            aria-label="avatar"
          >
            👤
          </span>
        )}
        <div>
          <div className="font-semibold text-base">{name}</div>
          {tagline && <div className="text-gray-500 text-sm">{tagline}</div>}
        </div>
      </div>
      <p className="text-gray-600 text-sm mb-2">{description}</p>
      {ctaLabel && onCtaClick && (
        <button
          className="mt-2 px-4 py-2 rounded-lg border border-blue-500 text-blue-600 font-semibold hover:bg-blue-50 transition"
          onClick={onCtaClick}
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}

export default AboutCreatorCard;
