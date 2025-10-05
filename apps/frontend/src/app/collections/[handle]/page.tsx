import { Metadata } from 'next';
import { getProductsByCollectionHandle } from '@/api/collections';
import { SortOption } from '@/types/collection';
import { api } from '@/api/client';
import { Settings2 } from 'lucide-react';

// Server components
import ProductGrid from './_components/productGrid';

// Client components (interactive)
import Pagination from './_components/pagination';
import ActiveFilters from './_components/activeFilters';
import { Filters } from './_components/filters/Filters';
import SortSelect from './_components/sortSelect';

type CollectionPageProps = {
  params: { handle: string };
  searchParams: {
    page?: string;
    sort?: string;
    [key: string]: string | undefined;
  };
};

function formatHandle(handle: string): string {
  const transformations: Record<string, string> = {
    mens: "Men's",
    womens: "Women's",
    kids: "Kids'",
    tshirt: 'T-Shirt',
    tshirts: 'T-Shirts',
    't-shirt': 'T-Shirt',
    't-shirts': 'T-Shirts',
    'long-sleeve': 'Long Sleeve',
    'short-sleeve': 'Short Sleeve',
    'crew-neck': 'Crew Neck',
    'v-neck': 'V-Neck',
  };

  let formatted = handle
    .split('-')
    .map((word) => {
      const lower = word.toLowerCase();
      return (
        transformations[lower] || word.charAt(0).toUpperCase() + word.slice(1)
      );
    })
    .join(' ');

  formatted = formatted
    .replace(/\bT Shirt\b/g, 'T-Shirt')
    .replace(/\bT Shirts\b/g, 'T-Shirts')
    .replace(/\bLong Sleeve\b/g, 'Long Sleeve')
    .replace(/\bShort Sleeve\b/g, 'Short Sleeve');

  return formatted;
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { handle } = await params;

  return {
    title: `${formatHandle(handle)} | Your Store`,
    description: `Discover our ${formatHandle(handle)} collection. Shop the latest styles and trends now.`,
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: CollectionPageProps) {
  const { handle } = await params;
  const resolvedSearchParams = await searchParams;

  const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
  const currentSort = resolvedSearchParams.sort || 'manual';

  const sortOptions: SortOption[] = [
    { value: 'manual', label: 'Featured' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'date-asc', label: 'Date: Old to New' },
    { value: 'date-desc', label: 'Date: New to Old' },
    { value: 'alpha-asc', label: 'Alphabetically: Low to High' },
    { value: 'alpha-desc', label: 'Alphabetically: High to Low' },
  ];

  const filterParams = {
    vendor: resolvedSearchParams.vendor,
    productType: resolvedSearchParams.productType,
    gender: resolvedSearchParams.gender,
    size: resolvedSearchParams.size,
    color: resolvedSearchParams.color,
    minPrice: resolvedSearchParams.minPrice,
    maxPrice: resolvedSearchParams.maxPrice,
    inStock: resolvedSearchParams.inStock
      ? resolvedSearchParams.inStock === 'true'
      : undefined,
  };

  // Fetch data on server
  const [filtersFetch, productsFetch] = await Promise.all([
    api.get(`/collections/handle/${handle}/filters`),
    getProductsByCollectionHandle(
      handle,
      currentPage,
      30,
      currentSort,
      filterParams
    ),
  ]);

  const filters = filtersFetch.data.data;

  return (
    <main className="mb-20">
      <div className="my-15">
        <h1 className="text-center text-4xl font-medium tracking-tight uppercase">
          {formatHandle(handle)}
        </h1>
      </div>

      <section className="mx-12" aria-label="Product Listings">
        <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-12 md:grid-cols-[250px_minmax(0,1fr)]">
          {/* Top Bar - Server rendered except SortSelect */}
          <div className="col-span-2 hidden grid-cols-[inherit] items-center justify-between gap-x-[inherit] md:grid">
            <div className="flex items-center gap-3 font-medium">
              <Settings2 className="h-5 w-5" aria-hidden="true" />
              <span>Filters</span>
            </div>
            <div className="flex items-center pb-10">
              <ActiveFilters />
              <SortSelect
                options={sortOptions}
                currentSort={currentSort}
                collectionHandle={handle}
              />
            </div>
          </div>

          {/* Filters - Server rendered with client interactivity */}
          <Filters collectionHandle={handle} initialFilters={filters} />

          {/* Product Grid - Server rendered */}
          <ProductGrid products={productsFetch.data} />

          {/* Pagination - Server rendered with client navigation */}
          <Pagination
            currentPage={productsFetch.meta?.currentPage || 1}
            totalPages={productsFetch.meta?.totalPages || 1}
            collectionHandle={handle}
          />
        </div>
      </section>
    </main>
  );
}
