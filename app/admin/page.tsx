import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { Shield } from "lucide-react"

export default async function AdminPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Check if user is authenticated and is an admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?redirect=/admin")
  }

  // Check if user is an admin
  const { data: userData, error } = await supabase.from("users").select("is_admin, name").eq("id", user.id).single()

  if (error || !userData?.is_admin) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="sticky top-0 z-30 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              Logged in as <span className="font-semibold">{userData.name || user.email}</span>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 py-6">
        <div className="container">
          <AdminDashboard />
        </div>
      </main>
    </div>
  )
}
