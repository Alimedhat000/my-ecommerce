'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  collectionHandle: string;
}

export default function SortSelect({
  options,
  currentSort,
  collectionHandle,
}: SortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentOption = options.find((option) => option.value === currentSort);

  const handleSortChange = (sortValue: string) => {
    const current = new URLSearchParams(searchParams.toString());
    current.set('sort', sortValue);
    current.set('page', '1');
    router.push(`/collections/${collectionHandle}?${current.toString()}`);
  };

  return (
    <div className="ml-auto flex min-w-[350px] items-center justify-end gap-3">
      <Label
        htmlFor="sort-select"
        className="text-foreground text-sm font-bold"
      >
        Sort by
      </Label>
      <Select value={currentSort} onValueChange={handleSortChange}>
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
