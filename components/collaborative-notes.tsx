"use client"

import { useState, useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Collaboration from "@tiptap/extension-collaboration"
import CollaborationCursor from "@tiptap/extension-collaboration-cursor"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PresenceIndicator } from "./presence-indicator"
import * as Y from "yjs"
import { WebrtcProvider } from "y-webrtc"

type CollaborativeNotesProps = {
  tripId: string
  initialContent?: string
  placeholder?: string
  readOnly?: boolean
}

export function CollaborativeNotes({
  tripId,
  initialContent = "",
  placeholder = "Add notes about your trip...",
  readOnly = false,
}: CollaborativeNotesProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const supabase = createClient()

  // Set up Yjs document
  const ydoc = new Y.Doc()
  const provider = new WebrtcProvider(`trip-notes-${tripId}`, ydoc, {
    signaling: ["wss://signaling.yjs.dev"],
  })

  const ytext = ydoc.getText("trip-notes")

  // If there's initial content and the ytext is empty, set it
  if (initialContent && ytext.toString() === "") {
    ytext.insert(0, initialContent)
  }

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("name, avatar_url").eq("id", user.id).single()

        setCurrentUser({
          id: user.id,
          name: profile?.name || user.email?.split("@")[0] || "Anonymous",
          color: getRandomColor(user.id),
          avatar: profile?.avatar_url || `/api/avatar?name=${encodeURIComponent(profile?.name || "User")}`,
        })
      }
      setIsLoaded(true)
    }

    getUser()

    return () => {
      provider.destroy()
      ydoc.destroy()
    }
  }, [])

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          history: false,
        }),
        Collaboration.configure({
          document: ydoc,
        }),
        CollaborationCursor.configure({
          provider,
          user: currentUser,
        }),
      ],
      editable: !readOnly,
      content: "",
      editorProps: {
        attributes: {
          class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[200px] max-w-none",
        },
      },
    },
    [currentUser],
  )

  // Save the content to the database
  const saveContent = async () => {
    if (!editor) return

    setIsSaving(true)
    try {
      const content = editor.getHTML()

      await fetch(`/api/trips/${tripId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      })
    } catch (error) {
      console.error("Failed to save notes:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  return (
    <div className="border rounded-md p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Trip Notes</h3>
        <PresenceIndicator />
      </div>

      <EditorContent editor={editor} className="min-h-[200px]" />

      {!readOnly && (
        <div className="flex justify-end">
          <Button onClick={saveContent} disabled={isSaving} size="sm">
            {isSaving ? "Saving..." : "Save Notes"}
          </Button>
        </div>
      )}
    </div>
  )
}

// Generate a random color based on user ID
function getRandomColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }

  const hue = Math.abs(hash % 360)
  return `hsl(${hue}, 70%, 60%)`
}
