'use client';

import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSearch } from '@/contexts/search-context';
import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';

interface NavbarSearchProps {
  mobileView?: boolean;
  onSearch?: () => void;
}

export function NavbarSearch({ mobileView = false, onSearch }: NavbarSearchProps) {
  const { openSearch, setSearchQuery } = useSearch();
  const [inputValue, setInputValue] = useState('');

  const handleOpenSearch = useCallback(() => {
    if (!mobileView) {
      openSearch();
    }
    onSearch?.();
  }, [openSearch, mobileView, onSearch]);

  const handleSearchSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (inputValue.trim()) {
      setSearchQuery(inputValue.trim());
      openSearch();
      onSearch?.();
    }
  };

  if (mobileView) {
    return (
      <form onSubmit={handleSearchSubmit} className="relative w-full">
        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search destinations..."
          className="w-full rounded-md bg-background pl-8"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </form>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleOpenSearch}
      aria-label="Search"
      className="h-8 w-8 rounded-full"
    >
      <Search className="h-4 w-4" />
    </Button>
  );
}
