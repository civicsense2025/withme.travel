import Link from 'next/link';
import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white py-4 px-6 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/admin" className="text-xl font-bold">
            withme.travel Admin
          </Link>
        </div>
        <nav>
          <Link href="/" className="hover:underline">
            Back to Site
          </Link>
        </nav>
      </header>
      
      <div className="flex flex-1">
        <aside className="w-64 bg-slate-100 dark:bg-slate-800 p-6 hidden md:block">
          <nav className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Overview
              </h3>
              <div className="space-y-1">
                <Link 
                  href="/admin" 
                  className="block px-3 py-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Dashboard
                </Link>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Content
              </h3>
              <div className="space-y-1">
                <Link 
                  href="/admin/destinations" 
                  className="block px-3 py-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Destinations
                </Link>
                <Link 
                  href="/admin/itineraries" 
                  className="block px-3 py-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Itineraries
                </Link>
                <Link 
                  href="/admin/feedback" 
                  className="block px-3 py-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Feedback
                </Link>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Users
              </h3>
              <div className="space-y-1">
                <Link 
                  href="/admin/users" 
                  className="block px-3 py-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Manage Users
                </Link>
              </div>
            </div>
          </nav>
        </aside>
        
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 