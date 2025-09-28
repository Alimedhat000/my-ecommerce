import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import { Product } from '@/types/collection';
import ProductBadge from './productBadge';
import VariantSwatches from './variantSwatches';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images[0];
  const primaryCollection = product.collections[0];
  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <article className="bg-background relative grid grid-rows-[auto_1fr_auto] overflow-hidden rounded-md">
      {/* Badges */}
      {product.badges && product.badges.length > 0 && (
        <div className="absolute top-3 left-3 z-10 flex space-x-2">
          {product.badges.map((badge, index) => (
            <ProductBadge key={index} badge={badge} />
          ))}
        </div>
      )}

      {/* Product Image + Quick Add */}
      <div className="group relative">
        <Link href={`/products/${product.handle}`}>
          <Image
            src={primaryImage.src}
            alt={primaryImage.alt}
            width={primaryImage.width}
            height={primaryImage.height}
            className="w-full object-cover"
          />
        </Link>
        {/* Quick Add Button */}
        <button className="absolute right-3 bottom-3 hidden cursor-pointer rounded-full bg-black px-5 py-2 text-sm font-semibold text-white shadow-lg group-hover:block">
          + Quick add
        </button>
      </div>

      {/* Info Section */}
      <div className="grid grid-rows-[auto_1fr_auto] space-y-3 p-4">
        {/* Collection Handle */}
        {primaryCollection && (
          <Link
            href={`/collections/${primaryCollection.handle}`}
            className="text-sm text-gray-500"
          >
            {primaryCollection.title}
          </Link>
        )}

        {/* Title & Pricing */}
        <div>
          <h3 className="font-semibold">
            <Link href={`/products/${product.handle}`}>{product.title}</Link>
          </h3>
          <div className="flex items-center space-x-2">
            <span
              className={hasDiscount ? 'font-bold text-red-600' : 'font-bold'}
            >
              {product.price.toFixed(2)} {product.currency}
            </span>
            {hasDiscount && (
              <span className="text-gray-400 line-through">
                {product.compareAtPrice!.toFixed(2)} {product.currency}
              </span>
            )}
          </div>
        </div>

        {/* Variant Swatches */}
        <VariantSwatches variants={product.variants} />
      </div>
    </article>
  );
}
