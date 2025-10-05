'use client';

import { Accordion } from '@/components/ui/accordion';
import { useFilters } from '../../_hooks/useFilters';
import { PriceFilter } from './PriceFilter';
import { CheckboxFilter } from './CheckboxFilter';
import { InStockFilter } from './InStockFilter';
import { FilterSection } from './FilterSection';

interface FiltersProps {
  collectionHandle: string;
  initialFilters: any;
}

export function Filters({ collectionHandle, initialFilters }: FiltersProps) {
  const filters = initialFilters;

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

  return (
    <aside aria-label="Filters" className="hidden h-full space-y-5 md:block">
      <div className="sticky -top-[21px] h-fit">
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
              onPriceChange={() => {}}
              onPriceCommit={handlePriceCommit}
            />
          </FilterSection>

          {/* Brand Filter */}
          {filters?.vendors && filters.vendors.length > 1 && (
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
          {filters?.productTypes && filters.productTypes.length > 1 && (
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
          {filters?.genders && filters.genders.length > 1 && (
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
          {filters?.sizes && filters.sizes.length > 1 && (
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
          {filters?.colors && filters.colors.length > 1 && (
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
