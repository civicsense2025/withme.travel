"use client"

import { useEffect } from 'react'
import { toast } from 'sonner'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to the console
    console.error('Application error:', error)

    // Show a toast notification
    toast.error('Something went wrong', {
      description: error.message || 'Please try again or refresh the page.',
      duration: 5000,
    })
  }, [error])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Something went wrong</h2>
        <p className="text-muted-foreground">
          {error.message || 'An error occurred. Please try again.'}
        </p>
        <button
          onClick={reset}
          className="rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

