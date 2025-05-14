'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  LayoutDashboard,
  MapPin,
  CalendarDays,
  FileText,
  Users,
  Lock,
  Settings,
  LogOut,
  BarChart,
  UserCheck,
  Globe,
  ClipboardList,
  Image as ImageIcon,
  FlaskConical,
  ChevronDown,
  ChevronRight,
  Palmtree,
} from 'lucide-react';

export function AdminSidebar() {
  const [researchOpen, setResearchOpen] = useState(false);

  return (
    <div className="w-64 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 shadow-sm">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center space-x-2">
          <div className="h-7 w-7 rounded-md bg-travel-purple flex items-center justify-center">
            <Lock className="h-3.5 w-3.5 text-white" />
          </div>
          <h1 className="text-lg font-semibold">Admin</h1>
        </div>
        <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Secure management area</div>
      </div>
      <nav className="p-3">
        <div className="space-y-5">
          <div>
            <h3 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-2 mb-2">
              Overview
            </h3>
            <ul className="space-y-0.5">
              <li>
                <Link
                  href="/admin"
                  className="flex items-center px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm transition-colors"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4 text-travel-purple" />
                  Overview
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/analytics"
                  className="flex items-center px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm transition-colors"
                >
                  <BarChart className="mr-2 h-4 w-4 text-travel-purple" />
                  Analytics
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-2 mb-2">
              Content
            </h3>
            <ul className="space-y-0.5">
              <li>
                <Link
                  href="/admin/destinations"
                  className="flex items-center px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm transition-colors"
                >
                  <MapPin className="mr-2 h-4 w-4 text-travel-purple" />
                  Destinations
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/itineraries"
                  className="flex items-center px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm transition-colors"
                >
                  <CalendarDays className="mr-2 h-4 w-4 text-travel-purple" />
                  Itineraries
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/media"
                  className="flex items-center px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm transition-colors"
                >
                  <ImageIcon className="mr-2 h-4 w-4 text-travel-purple" />
                  Media Library
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/content"
                  className="flex items-center px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm transition-colors"
                >
                  <FileText className="mr-2 h-4 w-4 text-travel-purple" />
                  Content
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/places"
                  className="flex items-center px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm transition-colors"
                >
                  <Globe className="mr-2 h-4 w-4 text-travel-purple" />
                  Places
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-2 mb-2">
              Users
            </h3>
            <ul className="space-y-0.5">
              <li>
                <Link
                  href="/admin/users"
                  className="flex items-center px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm transition-colors"
                >
                  <Users className="mr-2 h-4 w-4 text-travel-purple" />
                  User Management
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/auth-modal"
                  className="flex items-center px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm transition-colors"
                >
                  <UserCheck className="mr-2 h-4 w-4 text-travel-purple" />
                  Auth Analytics
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/surveys"
                  className="flex items-center px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm transition-colors"
                >
                  <ClipboardList className="mr-2 h-4 w-4 text-travel-purple" />
                  Surveys
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-2 mb-2">
              System
            </h3>
            <ul className="space-y-0.5">
              <li>
                <Link
                  href="/admin/security"
                  className="flex items-center px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm transition-colors"
                >
                  <Lock className="mr-2 h-4 w-4 text-travel-purple" />
                  Security
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/settings"
                  className="flex items-center px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm transition-colors"
                >
                  <Settings className="mr-2 h-4 w-4 text-travel-purple" />
                  Settings
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-2 mb-2">
              Partners
            </h3>
            <ul className="space-y-0.5">
              <li>
                <Link
                  href="/admin/viator"
                  className="flex items-center px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm transition-colors"
                >
                  <Palmtree className="mr-2 h-4 w-4 text-travel-purple" />
                  Viator Integration
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <Link
            href="/logout"
            className="flex items-center px-2 py-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm transition-colors"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Link>
        </div>
      </nav>
    </div>
  );
}
