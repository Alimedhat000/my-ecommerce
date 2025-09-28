import React from 'react';
import { X } from 'lucide-react';
import { ActiveFilter } from '@/types/collection';

interface ActiveFiltersProps {
  filters: ActiveFilter[];
  onRemoveFilter: (filterKey: string) => void;
}

export default function ActiveFilters({
  filters,
  onRemoveFilter,
}: ActiveFiltersProps) {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <div
          key={filter.key}
          className="text-muted-foreground border-ring flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
        >
          <span>{filter.displayText}</span>
          <button
            onClick={() => onRemoveFilter(filter.key)}
            className="rounded-full p-1 hover:bg-gray-200 focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 focus:outline-none"
            aria-label={`Remove filter ${filter.displayText}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
