import { Settings2 } from 'lucide-react';
import React from 'react';

type ProductPageProps = {
  params: { handle: string };
};

export default async function ProductPage({
  params: { handle },
}: ProductPageProps) {
  return (
    <main className="mb-20">
      <div className="my-10">
        <h1 className="text-center text-4xl font-bold uppercase">{handle}</h1>
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
          <aside aria-label="Filters" className="space-y-4">
            <h2 className="text-lg font-semibold">Filters</h2>
            <div>Faceted filter options here</div>
          </aside>

          {/* Results */}
          <section aria-label="Products" className="grid gap-6">
            <h2 className="sr-only">Product Results</h2>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {/* Example product card placeholder */}
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="rounded border p-4">
                  Product Card
                </div>
              ))}
            </div>
          </section>
          {/* pagination */}
          <nav
            aria-label="Pagination"
            className="-col-end-1 mt-8 box-border flex w-auto justify-center justify-self-center rounded-4xl border"
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
