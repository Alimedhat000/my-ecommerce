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
  const transformations: Record<string, string> = {
    // Direct replacements
    mens: "Men's",
    womens: "Women's",
    kids: "Kids'",
    tshirt: 'T-Shirt',
    tshirts: 'T-Shirts',

    // Common patterns
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

  // Handle common product name patterns
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

  // Parse search params for initial server-side data
  const resolvedSearchParams = await searchParams;
  const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
  const currentSort = resolvedSearchParams.sort || 'manual';

  const sortOptions: SortOption[] = [
    { value: 'manual', label: 'Featured' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'date-asc', label: 'Date: Old to New' },
    { value: 'date-desc', label: 'Date: New to Old' },
    { value: 'alpha-asc', label: 'Alphabtically: Low to High' },
    { value: 'alpha-desc', label: 'Alphabtically: High to Low' },
  ];

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['products', handle, currentPage, currentSort],
    queryFn: () =>
      getProductsByCollectionHandle(handle, currentPage, 30, currentSort),
  });

  await queryClient.prefetchQuery({
    queryKey: ['filters', handle],
    queryFn: () =>
      fetch(`/api/collections/handle/${handle}/filters`).then((res) =>
        res.json()
      ),
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
