"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { TripManagement } from "@/components/trip-management"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

export default function ManageTripPage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=/trips/${params.id}/manage`)
    }
  }, [user, loading, router, params.id])

  // Check if user has access to manage this trip
  useEffect(() => {
    if (user) {
      async function checkAccess() {
        try {
          setIsLoading(true)
          const response = await fetch(`/api/trips/${params.id}/members/check-access`)

          if (!response.ok) {
            if (response.status === 403) {
              toast({
                title: "Access denied",
                description: "You don't have permission to manage this trip",
                variant: "destructive",
              })
              router.push(`/trips/${params.id}`)
              return
            }
            throw new Error("Failed to check access")
          }

          const data = await response.json()
          setHasAccess(data.hasAccess)
        } catch (error) {
          console.error("Error checking access:", error)
          toast({
            title: "Error",
            description: "Failed to verify access permissions",
            variant: "destructive",
          })
          router.push(`/trips/${params.id}`)
        } finally {
          setIsLoading(false)
        }
      }

      checkAccess()
    }
  }, [user, params.id, toast, router])

  // Don't render anything while checking auth
  if (loading || !user) {
    return null
  }

  return (
    <div className="container py-6">
      <div className="flex items-center mb-6">
        <Link href={`/trips/${params.id}`}>
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            back to trip
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="w-full h-64 bg-muted animate-pulse rounded-lg"></div>
      ) : hasAccess ? (
        <TripManagement tripId={params.id} />
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground mt-2">You don't have permission to manage this trip.</p>
          <Button className="mt-4" onClick={() => router.push(`/trips/${params.id}`)}>
            Return to Trip
          </Button>
        </div>
      )}
    </div>
  )
}
