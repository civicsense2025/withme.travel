"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useSearch } from "@/contexts/search-context"

interface SearchFormProps {
  className?: string
  placeholder?: string
  buttonText?: string
  showButton?: boolean
}

export function SearchForm({
  className = "",
  placeholder = "Search destinations, trips...",
  buttonText = "Search",
  showButton = true,
}: SearchFormProps) {
  const router = useRouter()
  const { addToSearchHistory } = useSearch()
  const [query, setQuery] = useState("")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    addToSearchHistory(query, "destination")
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <form onSubmit={handleSubmit} className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      {showButton && (
        <Button type="submit" disabled={!query.trim()} className="lowercase">
          {buttonText}
        </Button>
      )}
    </form>
  )
}
