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
        <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-muted-foreground h-6 w-6" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          className="pl-18 h-14 text-lg px-4 py-4 placeholder:text-lg placeholder:italic"
        />
      </div>
      {showButton && (
        <Button 
          type="submit" 
          disabled={!query.trim()} 
          className="lowercase h-14 px-8 text-lg"
        >
          {buttonText}
        </Button>
      )}
    </form>
  )
}
