'use client';

import { useQuery } from '@tanstack/react-query';
import { Accordion } from '@/components/ui/accordion';
import { api } from '@/api/client';
import { useFilters } from '../../_hooks/useFilters';
import { PriceFilter } from './PriceFilter';
import { CheckboxFilter } from './CheckboxFilter';
import { InStockFilter } from './InStockFilter';
import { FilterSection } from './FilterSection';

interface FiltersProps {
  collectionHandle: string;
}

async function getAvailableFilters(collectionHandle: string) {
  const response = await api.get(
    `/collections/handle/${collectionHandle}/filters`
  );
  return response.data;
}

export function Filters({ collectionHandle }: FiltersProps) {
  const { data: filtersData, isLoading } = useQuery({
    queryKey: ['filters', collectionHandle],
    queryFn: () => getAvailableFilters(collectionHandle),
  });

  const filters = filtersData?.data;

  const {
    searchParams,
    updateFilters,
    handleMultiSelectChange,
    handleSingleSelectChange,
    isMultiSelectChecked,
    isSingleSelectSelected,
  } = useFilters(collectionHandle);

  const handleInStockChange = (checked: boolean) => {
    updateFilters({
      inStock: checked ? 'true' : null,
    });
  };

  const handlePriceCommit = (values: number[]) => {
    updateFilters({
      minPrice: values[0].toString(),
      maxPrice: values[1].toString(),
    });
  };

  if (isLoading) {
    return (
      <aside aria-label="Filters" className="hidden h-full space-y-6 md:block">
        <div className="sticky -top-[20px] h-fit">
          <h2 className="text-lg font-semibold">Filters</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-6 rounded bg-gray-200"></div>
                <div className="h-4 w-3/4 rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside aria-label="Filters" className="hidden h-full space-y-6 md:block">
      <div className="sticky -top-[20px] h-fit">
        <InStockFilter
          checked={searchParams.get('inStock') === 'true'}
          onChange={handleInStockChange}
        />

        <Accordion type="multiple" className="w-full" defaultValue={['price']}>
          {/* Price Filter */}
          <FilterSection value="price" title="Price">
            <PriceFilter
              priceRange={filters?.priceRange}
              searchParams={searchParams}
              onPriceChange={() => {}} // Local state handled internally
              onPriceCommit={handlePriceCommit}
            />
          </FilterSection>

          {/* Brand Filter */}
          {filters?.vendors && filters.vendors.length > 0 && (
            <FilterSection value="vendor" title="Brand">
              <CheckboxFilter
                type="single"
                filterKey="vendor"
                options={filters.vendors}
                searchParams={searchParams}
                onSingleSelect={handleSingleSelectChange}
                onMultiSelect={handleMultiSelectChange}
                isSingleSelected={isSingleSelectSelected}
                isMultiChecked={isMultiSelectChecked}
              />
            </FilterSection>
          )}

          {/* Product Type Filter */}
          {filters?.productTypes && filters.productTypes.length > 0 && (
            <FilterSection value="productType" title="Product Type">
              <CheckboxFilter
                type="single"
                filterKey="productType"
                options={filters.productTypes}
                searchParams={searchParams}
                onSingleSelect={handleSingleSelectChange}
                onMultiSelect={handleMultiSelectChange}
                isSingleSelected={isSingleSelectSelected}
                isMultiChecked={isMultiSelectChecked}
              />
            </FilterSection>
          )}

          {/* Gender Filter */}
          {filters?.genders && filters.genders.length > 0 && (
            <FilterSection value="gender" title="Gender">
              <CheckboxFilter
                type="multi"
                filterKey="gender"
                options={filters.genders}
                searchParams={searchParams}
                onSingleSelect={handleSingleSelectChange}
                onMultiSelect={handleMultiSelectChange}
                isSingleSelected={isSingleSelectSelected}
                isMultiChecked={isMultiSelectChecked}
              />
            </FilterSection>
          )}

          {/* Size Filter */}
          {filters?.sizes && filters.sizes.length > 0 && (
            <FilterSection value="size" title="Size">
              <CheckboxFilter
                type="multi"
                filterKey="size"
                options={filters.sizes}
                searchParams={searchParams}
                onSingleSelect={handleSingleSelectChange}
                onMultiSelect={handleMultiSelectChange}
                isSingleSelected={isSingleSelectSelected}
                isMultiChecked={isMultiSelectChecked}
              />
            </FilterSection>
          )}

          {/* Color Filter */}
          {filters?.colors && filters.colors.length > 0 && (
            <FilterSection value="color" title="Color">
              <CheckboxFilter
                type="multi"
                filterKey="color"
                options={filters.colors}
                searchParams={searchParams}
                onSingleSelect={handleSingleSelectChange}
                onMultiSelect={handleMultiSelectChange}
                isSingleSelected={isSingleSelectSelected}
                isMultiChecked={isMultiSelectChecked}
              />
            </FilterSection>
          )}
        </Accordion>
      </div>
    </aside>
  );
}
