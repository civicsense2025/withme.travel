import { redirect } from 'next/navigation';
import { checkAdminAuth } from './utils/auth';
import { AdminSidebar } from '@/components/features/admin/AdminSidebar';
import React from 'react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, error } = await checkAdminAuth();

  if (!isAdmin) {
    redirect('/login?redirectTo=/admin');
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <AdminSidebar />
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="sticky top-0 z-10 bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="px-8 py-4">
            <div className="flex items-center justify-end">
              <div className="text-sm px-3 py-1 rounded-full bg-travel-purple/10 text-travel-purple border border-travel-purple/20">
                Admin Mode
              </div>
            </div>
          </div>
        </div>
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}
