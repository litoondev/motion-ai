"use client";

import { useState, useCallback } from "react";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FilterOption {
  key: string;
  label: string;
  options: { label: string; value: string }[];
}

interface SearchFilterProps {
  searchPlaceholder?: string;
  filters?: FilterOption[];
  onSearch: (query: string) => void;
  onFilter: (filters: Record<string, string>) => void;
  initialSearch?: string;
  initialFilters?: Record<string, string>;
}

export function SearchFilter({
  searchPlaceholder = "Search...",
  filters = [],
  onSearch,
  onFilter,
  initialSearch = "",
  initialFilters = {},
}: SearchFilterProps) {
  const [search, setSearch] = useState(initialSearch);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>(initialFilters);

  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      onSearch(value);
    },
    [onSearch]
  );

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      const newFilters = { ...activeFilters };
      if (value === "") {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }
      setActiveFilters(newFilters);
      onFilter(newFilters);
    },
    [activeFilters, onFilter]
  );

  const clearAll = useCallback(() => {
    setSearch("");
    setActiveFilters({});
    onSearch("");
    onFilter({});
  }, [onSearch, onFilter]);

  const hasActiveFilters = search !== "" || Object.keys(activeFilters).length > 0;

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <div className="w-full sm:w-72">
        <Input
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          rightIcon={
            search ? (
              <button onClick={() => handleSearch("")} className="cursor-pointer">
                <X className="h-3.5 w-3.5" />
              </button>
            ) : undefined
          }
        />
      </div>

      {filters.map((filter) => (
        <select
          key={filter.key}
          value={activeFilters[filter.key] ?? ""}
          onChange={(e) => handleFilterChange(filter.key, e.target.value)}
          className="h-10 px-3 text-sm font-body bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-600)] focus:ring-2 focus:ring-[var(--color-primary-600)]/20 transition-colors"
        >
          <option value="">{filter.label}</option>
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearAll} leftIcon={<X className="h-3.5 w-3.5" />}>
          Clear
        </Button>
      )}
    </div>
  );
}
