import React from 'react';

interface AdminStatsCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  colorClass?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function AdminStatsCard({
  title,
  value,
  icon,
  colorClass = "bg-white dark:bg-slate-800",
  trend
}: AdminStatsCardProps) {
  return (
    <div className={`${colorClass} p-6 rounded-lg shadow-sm`}>
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-medium text-gray-500 dark:text-gray-400">{title}</h2>
          <p className="text-3xl font-bold mt-1">{value}</p>
          
          {trend && (
            <div className="flex items-center mt-2">
              <span className={`text-xs ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className="rounded-full p-3 bg-gray-100 dark:bg-slate-700">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
} 