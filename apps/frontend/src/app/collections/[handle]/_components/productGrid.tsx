import React from 'react';
import { Product } from '@/types/collection';
import ProductCard from './productCard';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
}

export default function ProductGrid({
  products,
  loading = false,
}: ProductGridProps) {
  if (loading) {
    return (
      <section
        aria-label="Products skeleton"
        className="grid [grid-auto-flow:dense] grid-cols-[repeat(2,auto)] gap-6 lg:grid-cols-[repeat(3,minmax(0,1fr))]"
      >
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            aria-label="Product Card Placeholder"
            className="h-96 animate-pulse rounded-md bg-gray-200"
          />
        ))}
      </section>
    );
  }

  return (
    <>
      <h2 className="sr-only">Product Results</h2>
      <section
        aria-label="Products"
        className="grid [grid-auto-flow:dense] grid-cols-[repeat(2,minmax(0,1fr))] gap-6 self-start lg:grid-cols-[repeat(3,minmax(0,1fr))]"
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>
    </>
  );
}
