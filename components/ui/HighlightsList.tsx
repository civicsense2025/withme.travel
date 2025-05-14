import React from 'react';

export interface HighlightsListProps {
  highlights: string[];
  title?: string;
}

/**
 * HighlightsList displays a bulleted list of highlights in a styled card.
 * @example <HighlightsList highlights={["Sunset cocktails", "Dancing samba"]} />
 */
export function HighlightsList({ highlights, title = 'Highlights' }: HighlightsListProps) {
  if (!highlights || highlights.length === 0) return null;
  return (
    <div className="rounded-2xl bg-white p-6 shadow min-w-[220px]">
      <h2 className="font-bold text-xl mb-2">{title}</h2>
      <ul className="list-disc pl-5 space-y-2 text-base text-gray-800">
        {highlights.map((item, idx) => (
          <li key={idx} className="leading-snug">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HighlightsList;
