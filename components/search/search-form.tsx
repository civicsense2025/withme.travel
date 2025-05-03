'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSearch } from '@/contexts/search-context';

interface SearchFormProps {
  className?: string;
  placeholder?: string;
  buttonText?: string;
  showButton?: boolean;
}

export function SearchForm({
  className = '',
  placeholder = 'Search destinations, trips...',
  buttonText = 'Search',
  showButton = true,
}: SearchFormProps) {
  const { addToSearchHistory } = useSearch();
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    addToSearchHistory(query, 'destination');
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <form onSubmit={handleSubmit} className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          className="pl-10 pr-4 py-3 placeholder:italic rounded-full h-auto w-full"
        />
      </div>
      {showButton && (
        <Button
          type="submit"
          disabled={!query.trim()}
          className="lowercase px-8 py-3 rounded-full h-auto w-full md:w-auto"
        >
          {buttonText}
        </Button>
      )}
    </form>
  );
}