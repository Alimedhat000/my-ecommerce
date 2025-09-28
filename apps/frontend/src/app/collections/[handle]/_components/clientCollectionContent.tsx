'use client';

import React, { useState, useCallback, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ActiveFilters from './activeFilters';
import SortSelect from './sortSelect';
import ProductGrid from './productGrid';
import Pagination from './pagination';
import { Product, ActiveFilter, SortOption } from '@/types/collection';
import Filters from './filters';
import { Settings2 } from 'lucide-react';

type ClientCollectionContentProps = {
  initialProducts: Product[];
  initialPage: number;
  initialSort: string;
  initialActiveFilters: ActiveFilter[];
  sortOptions: SortOption[];
  totalPages: number;
  collectionHandle: string;
};

export default function ClientCollectionContent({
  initialProducts,
  initialPage,
  initialSort,
  initialActiveFilters,
  sortOptions,
  totalPages,
  collectionHandle,
}: ClientCollectionContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [products] = useState<Product[]>(initialProducts);
  const [currentPage] = useState(initialPage);
  const [currentSort] = useState(initialSort);
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

      startTransition(() => {
        router.push(url);
      });
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
            currentSort={currentSort}
            onSortChange={handleSortChange}
          />
        </div>
      </div>

      {/* Filters */}
      <Filters />

      {/* Results */}
      <section aria-label="Products" className="grid gap-6">
        <h2 className="sr-only">Product Results</h2>
        <ProductGrid products={products} loading={isPending} />
      </section>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </>
  );
}
