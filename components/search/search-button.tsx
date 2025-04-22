"use client"

import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSearch } from "@/contexts/search-context"

export function SearchButton() {
  const { openSearch } = useSearch()
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0)
  }, [])

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-60 justify-between text-muted-foreground font-normal lowercase rounded-full border-travel-purple border-opacity-30 hover:bg-travel-purple hover:bg-opacity-10"
      onClick={openSearch}
    >
      <div className="flex items-center">
        <Search className="mr-2 h-4 w-4" />
        <span>search...</span>
      </div>
      <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        {isMac ? "⌘" : "Ctrl+"}K
      </kbd>
    </Button>
  )
}
