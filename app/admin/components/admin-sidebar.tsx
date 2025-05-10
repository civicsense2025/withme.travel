'use client';

import React from 'react';

interface AdminSidebarProps {
  children: React.ReactNode;
}

export function AdminSidebar({ children }: AdminSidebarProps) {
  return (
    <div className="w-64 h-screen bg-white dark:bg-black border-r border-zinc-200 dark:border-zinc-800 shadow-lg">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xl font-bold">Admin</h2>
        <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Management Area
        </div>
      </div>
      <div className="overflow-y-auto">
        {children}
      </div>
    </div>
  );
} 