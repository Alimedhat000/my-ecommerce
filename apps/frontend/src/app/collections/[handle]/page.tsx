import { Settings2, X } from 'lucide-react';
import React from 'react';
import ProductCard from './_components/productCard';
import { Metadata } from 'next';
import Filters from './_components/filters';

type CollectionPageProps = {
  params: { handle: string };
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
  const handle = formatHandle(params.handle);

  return {
    title: `${handle}`,
    description: `Discover our ${handle} collection. Shop the latest styles and trends now on My Store.`,
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const handle = formatHandle(params.handle);

  return (
    <main className="mb-20">
      <div className="my-15">
        <h1 className="text-center text-4xl font-medium tracking-tight uppercase">
          {handle}
        </h1>
      </div>
      {/* Main Product grid */}
      <section className="mx-12" aria-label="Product Listings">
        <div className="mt-12 grid grid-cols-[250px_minmax(0,1fr)] gap-12">
          {/* Top bar */}
          <div className="col-span-2 grid grid-cols-[inherit] items-center justify-between gap-x-[inherit]">
            <div className="flex items-center gap-3 font-medium">
              <Settings2 className="h-5 w-5" aria-hidden="true" />
              <span>Filters</span>
            </div>
            <div className="flex items-center">
              {/* Active Filters */}
              <div className="flex flex-wrap gap-2">
                {/* Availability */}
                <div className="text-muted-foreground border-ring flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
                  <span>Availability: In stock</span>
                  <button
                    className="rounded-full p-1 hover:bg-gray-200 focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 focus:outline-none"
                    aria-label="Remove filter Availability: In stock"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Brand */}
                <div className="text-muted-foreground border-ring flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
                  <span>Brand: Test Brand</span>
                  <button
                    className="rounded-full p-1 hover:bg-gray-200 focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 focus:outline-none"
                    aria-label="Remove filter Brand: Test Brand"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Sort By */}
              <div className="ml-auto flex items-center justify-end gap-2">
                <label htmlFor="sort" className="font-bold">
                  Sort by
                </label>
                <select
                  id="sort"
                  name="sort"
                  className="rounded border px-3 py-1 text-sm"
                >
                  <option value="popular">Most Popular</option>
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Filters */}
          <Filters />

          {/* Results */}
          <section aria-label="Products" className="grid gap-6">
            <h2 className="sr-only">Product Results</h2>
            <div className="grid [grid-auto-flow:dense] grid-cols-[repeat(2,auto)] gap-6 lg:grid-cols-[repeat(3,minmax(0,1fr))]">
              {/* Example product card placeholder */}
              {Array.from({ length: 12 }).map((_, index) => (
                <ProductCard key={index} long={index % 2 == 0} />
              ))}
            </div>
          </section>
          {/* pagination */}
          <nav
            aria-label="Pagination"
            className="border-ring -col-end-1 mt-8 box-border flex w-auto justify-center justify-self-center rounded-4xl border"
          >
            <span className="group inline-flex items-center px-5">
              <div className="animated-arrow animated-arrow--reverse animated-arrow--disabled"></div>
            </span>
            <span className="px-2 py-3">1&nbsp;&nbsp;/&nbsp;&nbsp;5</span>
            <span className="group inline-flex items-center px-5">
              <div className="animated-arrow"></div>
            </span>
          </nav>
        </div>
      </section>
    </main>
  );
}
