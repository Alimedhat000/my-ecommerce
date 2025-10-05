'use client';

import React from 'react';
import { X } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

interface ActiveFilter {
  key: string;
  label: string;
  value: string;
  displayText: string;
}

export default function ActiveFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Extract active filters from URL search params
  const getActiveFilters = (): ActiveFilter[] => {
    const filters: ActiveFilter[] = [];

    // Check for price range first
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    if (minPrice || maxPrice) {
      const min = minPrice ? parseInt(minPrice) : 0;
      const max = maxPrice ? parseInt(maxPrice) : 1750;

      filters.push({
        key: 'priceRange',
        label: 'Price Range',
        value: `${min}-${max}`,
        displayText: `Price: ${min} - ${max} EGP`,
      });
    }

    // Single value filters
    const singleValueFilters = ['vendor', 'productType', 'inStock'];

    singleValueFilters.forEach((key) => {
      const value = searchParams.get(key);
      if (value) {
        let displayText = '';

        switch (key) {
          case 'vendor':
            displayText = `Brand: ${value}`;
            break;
          case 'productType':
            displayText = `Type: ${value}`;
            break;
          case 'inStock':
            displayText = 'In Stock Only';
            break;
          default:
            displayText = `${key}: ${value}`;
        }

        filters.push({
          key,
          label: key.charAt(0).toUpperCase() + key.slice(1),
          value,
          displayText,
        });
      }
    });

    // Array value filters
    const arrayValueFilters = ['gender', 'size', 'color'];

    arrayValueFilters.forEach((key) => {
      const value = searchParams.get(key);
      if (value) {
        const values = value.split(',');
        values.forEach((item) => {
          let displayText = '';

          switch (key) {
            case 'gender':
              displayText = `Gender: ${item}`;
              break;
            case 'size':
              displayText = `Size: ${item}`;
              break;
            case 'color':
              displayText = `Color: ${item}`;
              break;
            default:
              displayText = `${key}: ${item}`;
          }

          filters.push({
            key,
            label: key.charAt(0).toUpperCase() + key.slice(1),
            value: item,
            displayText,
          });
        });
      }
    });

    return filters;
  };

  const activeFilters = getActiveFilters();

  const handleRemove = (filter: ActiveFilter) => {
    const current = new URLSearchParams(searchParams.toString());

    if (filter.key === 'priceRange') {
      current.delete('minPrice');
      current.delete('maxPrice');
    } else {
      const arrayFilters = ['gender', 'size', 'color'];

      if (arrayFilters.includes(filter.key)) {
        const currentValues = searchParams.get(filter.key)?.split(',') || [];
        const newValues = currentValues.filter((v) => v !== filter.value);

        if (newValues.length === 0) {
          current.delete(filter.key);
        } else {
          current.set(filter.key, newValues.join(','));
        }
      } else {
        current.delete(filter.key);
      }
    }

    current.set('page', '1');
    router.push(`?${current.toString()}`);
  };

  const handleRemoveAll = () => {
    const current = new URLSearchParams(searchParams.toString());
    const sort = current.get('sort');

    const newParams = new URLSearchParams();
    if (sort) newParams.set('sort', sort);
    newParams.set('page', '1');

    router.push(`?${newParams.toString()}`);
  };

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {activeFilters.map((filter, index) => (
          <div
            key={`${filter.key}-${filter.value}-${index}`}
            className="text-muted-foreground border-ring flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
          >
            <span>{filter.displayText}</span>
            <button
              onClick={() => handleRemove(filter)}
              className="rounded-full p-1 hover:bg-gray-200 focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 focus:outline-none"
              aria-label={`Remove filter ${filter.displayText}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <button
          onClick={handleRemoveAll}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 rounded-full border border-transparent px-3 py-1 text-sm transition-colors hover:underline"
          aria-label="Remove all filters"
        >
          <span>Clear all</span>
        </button>
      </div>
    </div>
  );
}
