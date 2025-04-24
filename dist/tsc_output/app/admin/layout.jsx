import Link from 'next/link';
import { Home, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserNav } from '@/components/layout/user-nav'; // Assuming you have a UserNav component
// Simple Sidebar component (can be extracted later)
const AdminSidebar = () => {
    return (<aside className="w-64 border-r bg-background p-4 flex flex-col">
      <h2 className="text-xl font-semibold mb-6">Admin Panel</h2>
      <nav className="flex flex-col space-y-2 flex-grow">
        <Button variant="ghost" className="justify-start" asChild>
          <Link href="/admin/dashboard"><Home className="mr-2 h-4 w-4"/> Dashboard</Link>
        </Button>
        <Button variant="ghost" className="justify-start" asChild>
          <Link href="/admin/destinations"><Map className="mr-2 h-4 w-4"/> Destinations</Link>
        </Button>
        {/* Add more admin links as needed */}
        {/* <Button variant="ghost" className="justify-start" asChild>
          <Link href="/admin/users"><Users className="mr-2 h-4 w-4" /> Users</Link>
        </Button>
        <Button variant="ghost" className="justify-start" asChild>
          <Link href="/admin/settings"><Settings className="mr-2 h-4 w-4" /> Settings</Link>
        </Button> */}
      </nav>
      {/* Logout or User Info could go here */}
      <div className="mt-auto">
        {/* Placeholder for future logout functionality within admin */}
      </div>
    </aside>);
};
export default function AdminLayout({ children }) {
    // Note: The middleware already protects this layout/route
    return (<div className="flex h-screen bg-muted/40">
      <AdminSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6">
           {/* Maybe add a mobile nav toggle here */}
          <div className="flex-1">
             {/* Search or other header elements */}
          </div>
           {/* Assuming UserNav handles user menu/logout */}
          <UserNav /> 
        </header>
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>);
}
