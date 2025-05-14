import React from 'react';

export interface EssentialsSectionProps {
  pace: string;
  budget: string;
  startTime: string;
  tags?: string[];
  languages?: string[];
}

/**
 * EssentialsSection displays key info about a destination or itinerary (pace, budget, start time, tags, languages).
 * @example <EssentialsSection pace="Energetic" budget="$180/day" startTime="08:30 AM" tags={["nightlife"]} languages={["Portuguese"]} />
 */
export function EssentialsSection({
  pace,
  budget,
  startTime,
  tags = [],
  languages = [],
}: EssentialsSectionProps) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow flex flex-col gap-4 min-w-[260px]">
      <h2 className="font-bold text-xl mb-2">✨ Essentials</h2>
      <div className="flex flex-wrap gap-8 mb-2">
        <div>
          <div className="text-xs text-gray-500">Pace</div>
          <div className="font-medium text-base">{pace}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Budget</div>
          <div className="font-medium text-base">{budget}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Typical Start</div>
          <div className="font-medium text-base">{startTime}</div>
        </div>
      </div>
      {tags.length > 0 && (
        <div className="mb-2">
          <div className="text-xs text-gray-500 mb-1">Perfect For</div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, idx) => (
              <span key={idx} className="bg-gray-100 rounded-full px-3 py-1 text-sm text-gray-700">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
      {languages.length > 0 && (
        <div>
          <div className="text-xs text-gray-500 mb-1">Languages</div>
          <div className="flex flex-wrap gap-2">
            {languages.map((lang, idx) => (
              <span key={idx} className="bg-gray-100 rounded-full px-3 py-1 text-sm text-gray-700">
                {lang}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default EssentialsSection;
