import React from 'react';

export interface QuickFact {
  label: string;
  icon?: React.ReactNode;
  value: string | number;
}

export interface QuickFactsCardProps {
  title?: string;
  facts: QuickFact[];
}

/**
 * QuickFactsCard displays a list of quick facts in a styled card.
 * @example <QuickFactsCard title="Quick Facts" facts={[{label: 'Best Time', value: 'Summer'}]} />
 */
export function QuickFactsCard({ title = 'Quick Facts', facts }: QuickFactsCardProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow flex flex-col gap-4 min-w-[260px]">
      {title && <h2 className="font-bold text-xl mb-2">{title}</h2>}
      <ul className="flex flex-col gap-3">
        {facts.map((fact, idx) => (
          <li key={idx} className="flex items-center gap-3">
            {fact.icon && <span className="text-lg">{fact.icon}</span>}
            <span className="text-gray-500 text-sm">{fact.label}</span>
            <span className="ml-auto font-semibold text-base text-black">{fact.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default QuickFactsCard;
