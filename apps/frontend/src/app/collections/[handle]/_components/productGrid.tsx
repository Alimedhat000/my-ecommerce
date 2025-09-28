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
      <div className="grid [grid-auto-flow:dense] grid-cols-[repeat(2,auto)] gap-6 lg:grid-cols-[repeat(3,minmax(0,1fr))]">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className="h-96 animate-pulse rounded-md bg-gray-200"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid [grid-auto-flow:dense] grid-cols-[repeat(2,auto)] gap-6 lg:grid-cols-[repeat(3,minmax(0,1fr))]">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
