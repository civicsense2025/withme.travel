import React from 'react';

interface StatItem {
  label: string;
  value: number | string;
}

interface ActivitySummaryProps {
  stats: StatItem[];
  title?: string;
}

export function ActivitySummary({ stats, title = "Activity Summary" }: ActivitySummaryProps) {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="space-y-4">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className={`flex justify-between items-center pb-2 ${
              index < stats.length - 1 ? 'border-b' : ''
            }`}
          >
            <span>{stat.label}</span>
            <span className="font-bold">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 