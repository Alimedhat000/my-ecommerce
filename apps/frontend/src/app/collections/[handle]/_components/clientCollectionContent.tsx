'use client';

import React, { useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ActiveFilters from './activeFilters';
import SortSelect from './sortSelect';
import ProductGrid from './productGrid';
import Pagination from './pagination';
import { SortOption } from '@/types/collection';
import { Settings2 } from 'lucide-react';

import { useQuery } from '@tanstack/react-query';
import { getProductsByCollectionHandle } from '@/api/collections';
import { Filters } from './filters/Filters';

type ClientCollectionContentProps = {
  sortOptions: SortOption[];
  collectionHandle: string;
};

export default function ClientCollectionContent({
  sortOptions,
  collectionHandle,
}: ClientCollectionContentProps) {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page') ?? '1');
  const sort = searchParams.get('sort') ?? 'manual';

  const vendor = searchParams.get('vendor');
  const productType = searchParams.get('productType');
  const gender = searchParams.get('gender');
  const size = searchParams.get('size');
  const color = searchParams.get('color');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const inStock = searchParams.get('inStock');

  const {
    data: fetchedProducts,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [
      'products',
      collectionHandle,
      {
        page,
        sort,
        vendor,
        productType,
        gender,
        size,
        color,
        minPrice,
        maxPrice,
        inStock,
      },
    ],
    queryFn: async () => {
      const res = await getProductsByCollectionHandle(
        collectionHandle,
        page,
        30,
        sort,
        {
          vendor: vendor || undefined,
          productType: productType || undefined,
          gender: gender || undefined,
          size: size || undefined,
          color: color || undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          inStock: inStock ? inStock === 'true' : undefined,
        }
      );
      return res;
    },
  });

  const router = useRouter();

  useEffect(() => {
    // Disable automatic scroll restoration
    window.history.scrollRestoration = 'manual';
  }, [router]);

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
    (filterKey: string, filterValue?: string) => {
      if (filterKey === 'priceRange') {
        updateUrl({
          minPrice: null,
          maxPrice: null,
        });
        return;
      }

      if (filterValue) {
        // Handle array filters - remove specific value
        const currentValues = searchParams.get(filterKey)?.split(',') || [];
        const newValues = currentValues.filter((v) => v !== filterValue);

        if (newValues.length === 0) {
          updateUrl({ [filterKey]: null });
        } else {
          updateUrl({ [filterKey]: newValues.join(',') });
        }
      } else {
        // Handle single value filters - remove entire filter
        updateUrl({ [filterKey]: null });
      }
    },
    [updateUrl, searchParams]
  );

  const handleRemoveAllFilters = useCallback(() => {
    updateUrl({
      vendor: null,
      productType: null,
      gender: null,
      size: null,
      color: null,
      minPrice: null,
      maxPrice: null,
      inStock: null,
    });
  }, [updateUrl]);

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
            onRemoveFilter={handleRemoveFilter}
            onRemoveAllFilters={handleRemoveAllFilters}
          />

          <SortSelect
            options={sortOptions}
            currentSort={sort}
            onSortChange={handleSortChange}
          />
        </div>
      </div>

      {/* Filters */}
      <Filters collectionHandle={collectionHandle} />

      {/* Results */}
      <ProductGrid
        products={fetchedProducts?.data ?? []}
        loading={isFetching && !isLoading}
      />

      {/* Pagination */}
      <Pagination
        currentPage={fetchedProducts?.meta.currentPage ?? 1}
        totalPages={fetchedProducts?.meta.totalPages ?? 1}
        onPageChange={handlePageChange}
      />
    </>
  );
}
