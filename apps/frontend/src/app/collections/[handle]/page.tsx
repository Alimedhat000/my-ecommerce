import { Metadata } from 'next';
import ClientCollectionContent from './_components/clientCollectionContent';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { getProductsByCollectionHandle } from '@/api/collections';

import { SortOption } from '@/types/collection';

type CollectionPageProps = {
  params: { handle: string };
  searchParams: {
    page?: string;
    sort?: string;
    [key: string]: string | undefined;
  };
};

function formatHandle(handle: string): string {
  const specialCases: Record<string, string> = {
    mens: "Men's",
    womens: "Women's",
    kids: "Kids'",
  };

  return handle
    .split('-')
    .map((word) => {
      const lower = word.toLowerCase();
      if (specialCases[lower]) return specialCases[lower];
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
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

  // Parse search params for initial server-side data
  const resolvedSearchParams = await searchParams;
  const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
  const currentSort = resolvedSearchParams.sort || 'popular';

  // Extract filters from searchParams
  const filters = Object.entries(resolvedSearchParams)
    .filter(([key]) => !['page', 'sort'].includes(key))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

  const sortOptions: SortOption[] = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'newest', label: 'Newest' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
  ];

  // Convert filters to active filters format
  const activeFilters = Object.entries(filters).map(([key, value]) => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    value: value as string,
    displayText: `${key}: ${value}`,
  }));

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['products', handle],
    queryFn: () => getProductsByCollectionHandle(handle, currentPage),
  });

  return (
    <main className="mb-20">
      <div className="my-15">
        <h1 className="text-center text-4xl font-medium tracking-tight uppercase">
          {formatHandle(handle)}
        </h1>
      </div>

      <section className="mx-12" aria-label="Product Listings">
        <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-12 md:grid-cols-[250px_minmax(0,1fr)]">
          {/* Top bar */}
          <div className="col-span-2 grid grid-cols-[inherit] items-center justify-between gap-x-[inherit]">
            {/* Client component handles interactive filtering/sorting */}
            <HydrationBoundary state={dehydrate(queryClient)}>
              <ClientCollectionContent
                initialSort={currentSort}
                initialActiveFilters={activeFilters}
                sortOptions={sortOptions}
                collectionHandle={handle}
              />
            </HydrationBoundary>
          </div>
        </div>
      </section>
    </main>
  );
}
