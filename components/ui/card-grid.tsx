import React, { useMemo, useState } from 'react';

export interface CardGridFilter {
  label: string;
  value: string;
}

export interface CardGridSortOption {
  label: string;
  value: string;
}

interface CardGridProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  filters?: CardGridFilter[];
  sortOptions?: CardGridSortOption[];
  searchPlaceholder?: string;
  getFilterValue?: (item: T) => string;
  getSortValue?: (item: T, sort: string) => any;
  getSearchText?: (item: T) => string;
  emptyState?: React.ReactNode;
}

export function CardGrid<T>({
  items,
  renderItem,
  filters = [],
  sortOptions = [],
  searchPlaceholder = 'Search...',
  getFilterValue,
  getSortValue,
  getSearchText,
  emptyState = <div className="text-muted-foreground text-center py-8">No results found.</div>,
}: CardGridProps<T>) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(filters[0]?.value ?? '');
  const [sort, setSort] = useState(sortOptions[0]?.value ?? '');

  // Filtered, searched, and sorted items
  const filteredItems = useMemo(() => {
    let result = items;
    if (filters.length && getFilterValue && filter) {
      result = result.filter((item) => getFilterValue(item) === filter || filter === 'all');
    }
    if (search && getSearchText) {
      const s = search.toLowerCase();
      result = result.filter((item) => getSearchText(item).toLowerCase().includes(s));
    }
    if (sortOptions.length && getSortValue && sort) {
      result = [...result].sort((a, b) => {
        const aVal = getSortValue(a, sort);
        const bVal = getSortValue(b, sort);
        if (aVal < bVal) return -1;
        if (aVal > bVal) return 1;
        return 0;
      });
    }
    return result;
  }, [
    items,
    filter,
    filters.length,
    getFilterValue,
    search,
    getSearchText,
    sort,
    sortOptions.length,
    getSortValue,
  ]);

  return (
    <div>
      <CardGridToolbar
        search={search}
        setSearch={setSearch}
        filters={filters}
        filter={filter}
        setFilter={setFilter}
        sortOptions={sortOptions}
        sort={sort}
        setSort={setSort}
        searchPlaceholder={searchPlaceholder}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {filteredItems.length === 0
          ? emptyState
          : filteredItems.map((item, i) => <div key={i}>{renderItem(item)}</div>)}
      </div>
    </div>
  );
}

interface CardGridToolbarProps {
  search: string;
  setSearch: (s: string) => void;
  filters: CardGridFilter[];
  filter: string;
  setFilter: (f: string) => void;
  sortOptions: CardGridSortOption[];
  sort: string;
  setSort: (s: string) => void;
  searchPlaceholder: string;
}

function CardGridToolbar({
  search,
  setSearch,
  filters,
  filter,
  setFilter,
  sortOptions,
  sort,
  setSort,
  searchPlaceholder,
}: CardGridToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-3 md:gap-6 items-center justify-between">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={searchPlaceholder}
        className="input input-bordered w-full md:w-64"
      />
      <div className="flex gap-3">
        {filters.length > 0 && (
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="select select-bordered"
          >
            {filters.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        )}
        {sortOptions.length > 0 && (
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="select select-bordered"
          >
            {sortOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
