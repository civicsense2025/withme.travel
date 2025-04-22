import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/page-header"

export default function AdminLoading() {
  return (
    <div className="container py-6 space-y-6">
      <PageHeader heading="Admin Dashboard" text="Manage trips, users, and destinations for withme.travel" />
      <div className="grid gap-6">
        <div className="border rounded-lg p-4">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
