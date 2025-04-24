"use client";
import { useState } from "react";
import { AdminTrips } from "@/components/admin/admin-trips";
import { AdminUsers } from "@/components/admin/admin-users";
import { AdminDestinations } from "@/components/admin/admin-destinations";
import { AdminOverview } from "@/components/admin/admin-overview";
import { cn } from "@/lib/utils";
import { Users, Map, PlaneLanding, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
export function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("overview");
    const router = useRouter();
    const supabase = createClient();
    const sidebarItems = [
        {
            icon: <LayoutDashboard className="h-5 w-5"/>,
            label: "Dashboard",
            value: "overview"
        },
        {
            icon: <PlaneLanding className="h-5 w-5"/>,
            label: "Trips",
            value: "trips"
        },
        {
            icon: <Users className="h-5 w-5"/>,
            label: "Users",
            value: "users"
        },
        {
            icon: <Map className="h-5 w-5"/>,
            label: "Destinations",
            value: "destinations"
        }
    ];
    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };
    return (<div className="flex h-[calc(100vh-10rem)] overflow-hidden rounded-lg border bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/40">
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid gap-1 px-2">
              {sidebarItems.map((item) => (<Button key={item.value} variant={activeTab === item.value ? "secondary" : "ghost"} className={cn("justify-start gap-3 font-normal", activeTab === item.value && "bg-secondary")} onClick={() => setActiveTab(item.value)}>
                  {item.icon}
                  {item.label}
                </Button>))}
            </nav>
          </div>
          <div className="border-t p-2">
            <Button variant="ghost" className="w-full justify-start gap-3 font-normal" onClick={handleLogout}>
              <LogOut className="h-5 w-5"/>
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === "overview" && (<>
            <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
            <AdminOverview />
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Welcome to the Admin Dashboard</h3>
              <p className="text-muted-foreground">
                Use the sidebar to manage trips, users, and destinations for withme.travel.
              </p>
            </div>
          </>)}
        {activeTab === "trips" && <AdminTrips />}
        {activeTab === "users" && <AdminUsers />}
        {activeTab === "destinations" && <AdminDestinations />}
      </div>
    </div>);
}
