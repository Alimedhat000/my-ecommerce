import { Metadata } from 'next';
import ClientCollectionContent from './_components/clientCollectionContent';
// import { getProducts, getCollectionMetadata } from '@/lib/api';
import { Product, SortOption } from '@/types/collection';

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
  // Optionally fetch more detailed metadata from your API
  // const metadata = await getCollectionMetadata(params.handle);

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

  // Fetch initial data on server
  const products: Product[] = [
    {
      id: '1',
      title: 'Premium Cotton T-Shirt',
      handle: 'premium-cotton-tshirt',
      price: 2999,
      compareAtPrice: 3999,
      currency: 'USD',
      images: [
        {
          id: 'img-1',
          src: '/placeholder.webp',
          alt: 'Premium Cotton T-Shirt',
          width: 600,
          height: 600,
        },
      ],
      variants: [
        {
          id: 'v1',
          title: 'Small / White',
          color: 'white',
          colorName: 'White',
          colorHex: '#FFFFFF',
          available: true,
          price: 2999,
          compareAtPrice: 3999,
        },
        {
          id: 'v2',
          title: 'Medium / Black',
          color: 'black',
          colorName: 'Black',
          colorHex: '#000000',
          available: true,
          price: 2999,
        },
      ],
      badges: [{ text: 'UniSex', type: 'category' }],
      collections: [
        { handle: 'mens', title: "Men's" },
        { handle: 'tshirts', title: 'T-Shirts' },
      ],
    },
    {
      id: '2',
      title: 'Denim Jacket Classic',
      handle: 'denim-jacket-classic',
      price: 8999,
      currency: 'USD',
      images: [
        {
          id: 'img-2',
          src: '/placeholder.webp',
          alt: 'Denim Jacket Classic',
          width: 600,
          height: 600,
        },
      ],
      badges: [
        { text: '50%', type: 'sale' },
        { text: 'UniSex', type: 'category' },
      ],

      variants: [
        {
          id: 'v3',
          title: 'Blue / Medium',
          color: 'blue',
          colorName: 'Indigo Blue',
          colorHex: '#1F3A93',
          available: true,
          price: 8999,
        },
        {
          id: 'v4',
          title: 'Black / Large',
          color: 'black',
          colorName: 'Midnight Black',
          colorHex: '#0B0B0B',
          available: false,
          price: 8999,
        },
      ],
      collections: [
        { handle: 'outerwear', title: 'Outerwear' },
        { handle: 'jackets', title: 'Jackets' },
      ],
    },
    {
      id: '3',
      title: 'Sneakers Urban Style',
      handle: 'sneakers-urban-style',
      price: 12999,
      compareAtPrice: 15999,
      currency: 'USD',
      images: [
        {
          id: 'img-3',
          src: '/placeholder.webp',
          alt: 'Sneakers Urban Style',
          width: 600,
          height: 600,
        },
      ],
      variants: [
        {
          id: 'v5',
          title: 'White / Size 42',
          color: 'white',
          colorName: 'Cloud White',
          colorHex: '#F8F9FA',
          available: true,
          price: 12999,
          compareAtPrice: 15999,
        },
        {
          id: 'v6',
          title: 'Red / Size 43',
          color: 'red',
          colorName: 'Crimson Red',
          colorHex: '#DC143C',
          available: true,
          price: 12999,
        },
      ],
      collections: [
        { handle: 'shoes', title: 'Shoes' },
        { handle: 'sneakers', title: 'Sneakers' },
      ],
    },
    {
      id: '4',
      title: 'Wool Blend Sweater',
      handle: 'wool-blend-sweater',
      price: 6999,
      currency: 'USD',
      images: [
        {
          id: 'img-4',
          src: '/placeholder.webp',
          alt: 'Wool Blend Sweater',
          width: 600,
          height: 600,
        },
      ],
      variants: [
        {
          id: 'v7',
          title: 'Gray / Medium',
          color: 'gray',
          colorName: 'Heather Gray',
          colorHex: '#808080',
          available: true,
          price: 6999,
        },
        {
          id: 'v8',
          title: 'Navy / Large',
          color: 'blue',
          colorName: 'Navy Blue',
          colorHex: '#001F54',
          available: false,
          price: 6999,
        },
      ],
      collections: [
        { handle: 'sweaters', title: 'Sweaters' },
        { handle: 'winter', title: 'Winter Collection' },
      ],
    },
    {
      id: '5',
      title: 'Slim Fit Chinos',
      handle: 'slim-fit-chinos',
      price: 4999,
      compareAtPrice: 5999,
      currency: 'USD',
      images: [
        {
          id: 'img-5',
          src: '/placeholder.webp',
          alt: 'Slim Fit Chinos',
          width: 600,
          height: 600,
        },
      ],
      variants: [
        {
          id: 'v9',
          title: 'Beige / 32',
          color: 'beige',
          colorName: 'Sand Beige',
          colorHex: '#F5F5DC',
          available: true,
          price: 4999,
          compareAtPrice: 5999,
        },
        {
          id: 'v10',
          title: 'Khaki / 34',
          color: 'green',
          colorName: 'Khaki Green',
          colorHex: '#78866B',
          available: true,
          price: 4999,
        },
      ],
      collections: [
        { handle: 'pants', title: 'Pants' },
        { handle: 'chinos', title: 'Chinos' },
      ],
    },
    {
      id: '6',
      title: 'Leather Belt Brown',
      handle: 'leather-belt-brown',
      price: 3999,
      currency: 'USD',
      images: [
        {
          id: 'img-6',
          src: '/placeholder.webp',
          alt: 'Leather Belt Brown',
          width: 600,
          height: 600,
        },
      ],
      variants: [
        {
          id: 'v11',
          title: 'Brown / M',
          color: 'brown',
          colorName: 'Chestnut Brown',
          colorHex: '#8B4513',
          available: true,
          price: 3999,
        },
        {
          id: 'v12',
          title: 'Black / L',
          color: 'black',
          colorName: 'Matte Black',
          colorHex: '#000000',
          available: true,
          price: 3999,
        },
      ],
      collections: [
        { handle: 'accessories', title: 'Accessories' },
        { handle: 'belts', title: 'Belts' },
      ],
    },
  ];

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
            <ClientCollectionContent
              initialProducts={products}
              initialPage={currentPage}
              initialSort={currentSort}
              initialActiveFilters={activeFilters}
              sortOptions={sortOptions}
              totalPages={10}
              collectionHandle={formatHandle(handle)}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
