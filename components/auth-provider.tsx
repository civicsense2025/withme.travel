"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

type User = {
  id: string
  email: string
  name?: string
  avatar_url?: string
  provider?: string
  provider_token?: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  isGoogleConnected: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  isGoogleConnected: false,
})

// Optimize the AuthProvider to be more efficient and handle session changes better
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGoogleConnected, setIsGoogleConnected] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        setLoading(true)
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          // Get user data from our database
          const { data } = await supabase.from("users").select("*").eq("id", session.user.id).single()

          const userData = data || {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata.name || session.user.user_metadata.full_name,
            avatar_url: session.user.user_metadata.avatar_url,
          }

          // Add provider information
          const provider = session.user.app_metadata?.provider
          setIsGoogleConnected(provider === "google")

          setUser({
            ...userData,
            provider,
            provider_token: session.provider_token,
          })
        } else {
          setUser(null)
          setIsGoogleConnected(false)
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        setUser(null)
        setIsGoogleConnected(false)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event)

      if (session?.user) {
        try {
          // Get user data from our database
          const { data } = await supabase.from("users").select("*").eq("id", session.user.id).single()

          const userData = data || {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata.name || session.user.user_metadata.full_name,
            avatar_url: session.user.user_metadata.avatar_url,
          }

          // Add provider information
          const provider = session.user.app_metadata?.provider
          setIsGoogleConnected(provider === "google")

          setUser({
            ...userData,
            provider,
            provider_token: session.provider_token,
          })
        } catch (error) {
          console.error("Error fetching user data:", error)
          setIsGoogleConnected(false)
        }
      } else {
        setUser(null)
        setIsGoogleConnected(false)
      }

      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    setUser(null)
    setIsGoogleConnected(false)
    setLoading(false)
    router.push("/")
  }

  return <AuthContext.Provider value={{ user, loading, signOut, isGoogleConnected }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
