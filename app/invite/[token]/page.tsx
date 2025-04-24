"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, Loader2 } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

export default function InvitePage({ params }: { params: { token: string } }) {
  const supabase = createClient()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [invitation, setInvitation] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isAccepting, setIsAccepting] = useState(false)

  useEffect(() => {
    async function checkInvitation() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/invitations/${params.token}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError("This invitation link is invalid or has expired")
            return
          }
          throw new Error(`Failed to verify invitation: ${response.status}`)
        }

        const data = await response.json()
        setInvitation(data.invitation)
      } catch (err: any) {
        console.error("Error checking invitation:", err)
        setError(err.message || "Failed to verify invitation")
      } finally {
        setIsLoading(false)
      }
    }

    checkInvitation()
  }, [params.token])

  const handleAcceptInvitation = async () => {
    try {
      setIsAccepting(true)

      // Check if user is logged in
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        // If not logged in, redirect to signup with invitation token
        router.push(`/signup?invitation=${params.token}`)
        return
      }

      // User is logged in, accept the invitation
      const response = await fetch(`/api/invitations/${params.token}/accept`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to accept invitation")
      }

      const data = await response.json()

      toast({
        title: "Invitation accepted",
        description: "You've been added to the trip",
      })

      // Redirect to the trip
      router.push(`/trips/${data.tripId}`)
    } catch (err: any) {
      console.error("Error accepting invitation:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to accept invitation",
        variant: "destructive",
      })
      setIsAccepting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container max-w-md py-12">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-center text-muted-foreground">Verifying invitation...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !invitation) {
    return (
      <div className="container max-w-md py-12">
        <Card>
          <CardHeader>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>This invitation link is invalid or has expired</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error || "Invalid invitation link"}</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push("/")}>
              Go to Homepage
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-md py-12">
      <Card>
        <CardHeader>
          <CardTitle>Trip Invitation</CardTitle>
          <CardDescription>You've been invited to join a trip</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4">
            <h2 className="text-xl font-bold mb-2">{invitation.trip.name}</h2>
            <p className="text-muted-foreground">
              {invitation.inviter.name || invitation.inviter.email} has invited you to join this trip
            </p>
          </div>

          {invitation.trip.description && (
            <div>
              <h3 className="text-sm font-medium">Trip Description</h3>
              <p className="text-sm text-muted-foreground">{invitation.trip.description}</p>
            </div>
          )}

          {invitation.trip.start_date && invitation.trip.end_date && (
            <div>
              <h3 className="text-sm font-medium">Trip Dates</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(invitation.trip.start_date).toLocaleDateString()} -{" "}
                {new Date(invitation.trip.end_date).toLocaleDateString()}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button className="w-full" onClick={handleAcceptInvitation} disabled={isAccepting}>
            {isAccepting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Accepting...
              </>
            ) : (
              "Accept Invitation"
            )}
          </Button>
          <Button variant="outline" className="w-full" onClick={() => router.push("/")}>
            Maybe Later
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
