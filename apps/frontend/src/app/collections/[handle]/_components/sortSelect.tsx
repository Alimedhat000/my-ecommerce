import React from 'react';
import { SortOption } from '@/types/collection';

interface SortSelectProps {
  options: SortOption[];
  currentSort: string;
  onSortChange: (sortValue: string) => void;
}

export default function SortSelect({
  options,
  currentSort,
  onSortChange,
}: SortSelectProps) {
  return (
    <div className="ml-auto flex items-center justify-end gap-2">
      <label htmlFor="sort" className="font-bold">
        Sort by
      </label>
      <select
        id="sort"
        name="sort"
        value={currentSort}
        onChange={(e) => onSortChange(e.target.value)}
        className="rounded border px-3 py-1 text-sm"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
