import { redirect } from 'next/navigation';
import Link from 'next/link';
import { checkAdminAuth } from './utils/auth';
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
  ClipboardList
} from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, error } = await checkAdminAuth();

  if (!isAdmin) {
    redirect('/login?redirectTo=/admin');
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-semibold">Admin Panel</h1>
        </div>
        <nav className="p-4">
          <ul className="space-y-1">
            <li>
              <Link 
                href="/admin" 
                className="flex items-center p-2 rounded-md hover:bg-gray-800"
              >
                <LayoutDashboard className="mr-3 h-5 w-5" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/destinations" 
                className="flex items-center p-2 rounded-md hover:bg-gray-800"
              >
                <MapPin className="mr-3 h-5 w-5" />
                Destinations
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/itineraries" 
                className="flex items-center p-2 rounded-md hover:bg-gray-800"
              >
                <CalendarDays className="mr-3 h-5 w-5" />
                Itineraries
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/content" 
                className="flex items-center p-2 rounded-md hover:bg-gray-800"
              >
                <FileText className="mr-3 h-5 w-5" />
                Content
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/users" 
                className="flex items-center p-2 rounded-md hover:bg-gray-800"
              >
                <Users className="mr-3 h-5 w-5" />
                Users
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/security" 
                className="flex items-center p-2 rounded-md hover:bg-gray-800"
              >
                <Lock className="mr-3 h-5 w-5" />
                Security
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/settings" 
                className="flex items-center p-2 rounded-md hover:bg-gray-800"
              >
                <Settings className="mr-3 h-5 w-5" />
                Settings
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/analytics" 
                className="flex items-center p-2 rounded-md hover:bg-gray-800"
              >
                <BarChart className="mr-3 h-5 w-5" />
                Analytics
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/auth-modal" 
                className="flex items-center p-2 rounded-md hover:bg-gray-800"
              >
                <UserCheck className="mr-3 h-5 w-5" />
                Auth Analytics
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/surveys" 
                className="flex items-center p-2 rounded-md hover:bg-gray-800"
              >
                <ClipboardList className="mr-3 h-5 w-5" />
                Surveys
              </Link>
            </li>
            <li className="mt-6 pt-6 border-t border-gray-800">
              <Link 
                href="/logout" 
                className="flex items-center p-2 rounded-md text-red-400 hover:bg-gray-800"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1 bg-gray-100 dark:bg-gray-800 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
} 