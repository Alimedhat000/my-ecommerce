// hooks/useFilters.ts
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export function useFilters(collectionHandle: string) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const updateFilters = useCallback(
    (updates: Record<string, string | null>) => {
      const current = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) {
          current.delete(key);
        } else {
          current.set(key, value);
        }
      });

      current.set('page', '1');

      const url = `/collections/${collectionHandle}?${current.toString()}`;
      router.push(url, { scroll: false });
    },
    [collectionHandle, router, searchParams]
  );

  const handleMultiSelectChange = useCallback(
    (filterType: string, value: string, checked: boolean) => {
      const currentValues = searchParams.get(filterType)?.split(',') || [];
      let newValues: string[];

      if (checked) {
        newValues = [...currentValues, value];
      } else {
        newValues = currentValues.filter((v) => v !== value);
      }

      updateFilters({
        [filterType]: newValues.length > 0 ? newValues.join(',') : null,
      });
    },
    [searchParams, updateFilters]
  );

  const handleSingleSelectChange = useCallback(
    (filterType: string, value: string | null) => {
      updateFilters({ [filterType]: value });
    },
    [updateFilters]
  );

  const isMultiSelectChecked = useCallback(
    (filterType: string, value: string): boolean => {
      return searchParams.get(filterType)?.split(',').includes(value) || false;
    },
    [searchParams]
  );

  const isSingleSelectSelected = useCallback(
    (filterType: string, value: string): boolean => {
      return searchParams.get(filterType) === value;
    },
    [searchParams]
  );

  return {
    searchParams,
    updateFilters,
    handleMultiSelectChange,
    handleSingleSelectChange,
    isMultiSelectChecked,
    isSingleSelectSelected,
  };
}
