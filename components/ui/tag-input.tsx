import React, { useState, KeyboardEvent, ChangeEvent, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Tag } from '@/types/tag';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  existingTags?: Tag[];
}

export const TagInput: React.FC<TagInputProps> = ({
  value,
  onChange,
  placeholder = 'Add a tag',
  existingTags = [],
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !value.some((t) => t.toLowerCase() === trimmedTag.toLowerCase())) {
      onChange([...value, trimmedTag]);
    }
    setInputValue('');
    setSuggestions([]);
  };

  const removeTag = (tagToRemove: string) => { return onChange(value.filter((tag) => tag.toLowerCase() !== tagToRemove.toLowerCase())); };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const currentInput = e.target.value;
    setInputValue(currentInput);

    if (currentInput.trim()) {
      const filtered = existingTags.filter(
        (tag) =>
          tag.name.toLowerCase().includes(currentInput.toLowerCase()) &&
          !value.some((t) => t.toLowerCase() === tag.name.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
      e.preventDefault();
      const tagToAdd = inputValue.trim().replace(/,$/, '');
      addTag(tagToAdd);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  const handleSuggestionClick = (tag: Tag) => { return addTag(tag.name); };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => { return document.removeEventListener('mousedown', handleClickOutside); };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="flex flex-wrap gap-2 border border-input bg-background p-2 rounded-md min-h-[40px]">
        {value.map((tag, index) => (
          <div
            key={index}
            className="flex items-center bg-secondary text-secondary-foreground rounded px-2 py-0.5 text-sm"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1.5 text-muted-foreground hover:text-foreground focus:outline-none"
              aria-label={`Remove ${tag}`}
            >
              &times;
            </button>
          </div>
        ))}
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] border-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-0 bg-transparent shadow-none"
        />
      </div>
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-40 overflow-y-auto">
          {suggestions.map((tag) => (
            <li
              key={tag.id}
              className="px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground text-sm"
              onClick={() => handleSuggestionClick(tag)}
              onMouseDown={(e) => e.preventDefault()}
            >
              {tag.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};