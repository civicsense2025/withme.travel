"use client"

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class AuthErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      error,
      errorInfo: null
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo
    })
    
    // Log the error to an error reporting service
    console.error('Auth Error caught by boundary:', error, errorInfo)
  }

  private handleReset = (): void => {
    // Clear local storage and session storage
    try {
      localStorage.removeItem('supabase.auth.token')
      sessionStorage.clear()
    } catch (e) {
      console.error('Failed to clear storage:', e)
    }
    
    // Reset state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
    
    // Reload the page
    window.location.reload()
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      return this.props.fallback || (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100/80 dark:bg-red-900/20 mb-4">
            <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold">Authentication Error</h2>
          <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-md">
            There was a problem with the authentication system. This could be due to a network issue, session expiry, or a system problem.
          </p>
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-6 max-h-24 overflow-auto p-2 bg-slate-50 dark:bg-slate-900 rounded-md">
            {this.state.error?.message || "Unknown authentication error"}
          </div>
          <Button 
            onClick={this.handleReset}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reset & Reload
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

