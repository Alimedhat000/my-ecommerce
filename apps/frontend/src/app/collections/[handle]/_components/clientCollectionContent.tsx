'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ActiveFilters from './activeFilters';
import SortSelect from './sortSelect';
import ProductGrid from './productGrid';
import Pagination from './pagination';
import { ActiveFilter, SortOption } from '@/types/collection';
import Filters from './filters';
import { Settings2 } from 'lucide-react';

import { useQuery } from '@tanstack/react-query';
import { getProductsByCollectionHandle } from '@/api/collections';

type ClientCollectionContentProps = {
  initialSort: string;
  initialActiveFilters: ActiveFilter[];
  sortOptions: SortOption[];
  collectionHandle: string;
};

export default function ClientCollectionContent({
  initialActiveFilters,
  sortOptions,
  collectionHandle,
}: ClientCollectionContentProps) {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page') ?? '1');
  const sort = searchParams.get('sort') ?? 'manual';

  const {
    data: fetchedProducts,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['products', collectionHandle, page, sort],
    queryFn: async () => {
      const res = await getProductsByCollectionHandle(
        collectionHandle,
        page,
        30,
        sort
      );
      // console.log('Server response:', res);
      return {
        ...res,
      };
    },
  });

  const router = useRouter();

  useEffect(() => {
    // Disable automatic scroll restoration
    window.history.scrollRestoration = 'manual';
  }, [router]);

  const [activeFilters] = useState<ActiveFilter[]>(initialActiveFilters);

  const updateUrl = useCallback(
    (updates: Record<string, string | null>) => {
      const current = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) {
          current.delete(key);
        } else {
          current.set(key, value);
        }
      });

      const url = `/collections/${collectionHandle}?${current.toString()}`;

      router.push(url);
    },
    [collectionHandle, router, searchParams]
  );

  const handleRemoveFilter = useCallback(
    (filterKey: string) => {
      updateUrl({ [filterKey]: null });
    },
    [updateUrl]
  );

  const handleSortChange = useCallback(
    (sortValue: string) => {
      updateUrl({ sort: sortValue, page: '1' });
    },
    [updateUrl]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateUrl({ page: page.toString() });
    },
    [updateUrl]
  );

  return (
    <>
      {/* Top Bar */}
      <div className="col-span-2 hidden grid-cols-[inherit] items-center justify-between gap-x-[inherit] md:grid">
        <div className="flex items-center gap-3 font-medium">
          <Settings2 className="h-5 w-5" aria-hidden="true" />
          <span>Filters</span>
        </div>
        <div className="flex items-center pb-10">
          <ActiveFilters
            filters={activeFilters}
            onRemoveFilter={handleRemoveFilter}
          />
          <SortSelect
            options={sortOptions}
            currentSort={sort}
            onSortChange={handleSortChange}
          />
        </div>
      </div>

      {/* Filters */}
      <Filters />

      {/* Results */}
      <section aria-label="Products" className="grid gap-6">
        <h2 className="sr-only">Product Results</h2>
        <ProductGrid
          products={fetchedProducts?.data ?? []}
          loading={isFetching && !isLoading}
        />
      </section>

      {/* Pagination */}
      <Pagination
        currentPage={fetchedProducts?.meta.currentPage ?? 1}
        totalPages={fetchedProducts?.meta.totalPages ?? 1}
        onPageChange={handlePageChange}
      />
    </>
  );
}
