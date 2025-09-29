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
  const price = product.variants[0].price;
  const compareAtPrice = product.variants[0].compareAtPrice;
  const hasDiscount = compareAtPrice && compareAtPrice > price;

  const badges = [...(product.badges || [])];
  if (hasDiscount) {
    const discountPercent = Math.round(
      ((compareAtPrice! - price) / compareAtPrice!) * 100
    );
    badges.push({
      text: `Save ${discountPercent}%`,
      type: 'sale',
    });
  }

  if (product.tags.includes('Unisex'))
    badges.push({ text: 'Unisex', type: 'category' });

  if (product.tags.includes('Buy 2 Get 1'))
    badges.push({ text: 'Buy 2 Get 1', type: 'feature' });

  const allVariantsUnavailable = product.variants.every(
    (variant) => !variant.available
  );
  if (allVariantsUnavailable) {
    badges.push({ text: 'Sold Out', type: 'soldout' });
  }

  const leftBadges = badges.filter(
    (b) => b.type === 'sale' || b.type === 'soldout'
  );
  const rightBadges = badges.filter(
    (b) => b.type !== 'sale' && b.type !== 'soldout'
  );

  return (
    <article className="bg-background relative grid grid-rows-[auto_1fr_auto] overflow-hidden rounded-md">
      {/* Left-side Badges */}
      {leftBadges.length > 0 && (
        <div className="absolute top-3 left-3 z-10 flex flex-col items-start space-y-2">
          {leftBadges.map((badge, index) => (
            <ProductBadge key={index} badge={badge} />
          ))}
        </div>
      )}

      {/* Right-side Badges */}
      {rightBadges.length > 0 && (
        <div className="absolute top-3 right-3 z-10 flex flex-col items-end space-y-2">
          {rightBadges.map((badge, index) => (
            <ProductBadge key={index} badge={badge} />
          ))}
        </div>
      )}

      {/* Product Image + Quick Add */}
      <div className="group relative aspect-[65/100] w-full overflow-hidden rounded-t-md">
        <Link
          href={`/products/${product.handle}`}
          className="relative block h-full w-full"
        >
          <Image
            src={primaryImage.src}
            alt={primaryImage.alt ?? product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        <button className="absolute right-3 bottom-3 translate-y-2 transform rounded-full bg-black px-4 py-2 text-sm font-semibold text-white opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-gray-800">
          + Quick add
        </button>
      </div>

      {/* Info Section */}
      <div className="grid grid-rows-[auto_1fr_auto] space-y-3 p-4">
        {/* Vendor */}
        {product.vendor && (
          <div className="text-sm text-gray-500">{product.vendor}</div>
        )}

        {/* Title & Pricing */}
        <div>
          <h3 className="font-semibold">
            <Link href={`/products/${product.handle}`}>{product.title}</Link>
          </h3>
          <div className="flex items-center space-x-2">
            <span className={hasDiscount ? 'text-destructive' : ''}>
              {Number(price).toFixed(2)} EGP
            </span>
            {hasDiscount && (
              <span className="text-muted-foreground line-through">
                {Number(compareAtPrice!).toFixed(2)} EGP
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
