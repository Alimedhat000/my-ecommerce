import React from 'react';
import { SortOption } from '@/types/collection';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

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
  const currentOption = options.find((option) => option.value === currentSort);

  return (
    <div className="ml-auto flex min-w-[350px] items-center justify-end gap-3">
      <Label
        htmlFor="sort-select"
        className="text-foreground text-sm font-bold"
      >
        Sort by
      </Label>
      <Select value={currentSort} onValueChange={onSortChange}>
        <SelectTrigger
          id="sort-select"
          className="border-border bg-background w-[210px]"
        >
          <SelectValue>{currentOption?.label || 'Select...'}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
