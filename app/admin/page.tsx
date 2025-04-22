import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { PageHeader } from "@/components/page-header"

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
  const { data: userData, error } = await supabase.from("users").select("is_admin").eq("id", user.id).single()

  if (error || !userData?.is_admin) {
    redirect("/")
  }

  return (
    <div className="container py-6 space-y-6">
      <PageHeader heading="Admin Dashboard" text="Manage trips, users, and destinations for withme.travel" />
      <AdminDashboard />
    </div>
  )
}
