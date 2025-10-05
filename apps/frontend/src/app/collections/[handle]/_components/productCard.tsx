import React from 'react';
import { Product } from '@/types/collection';
import ProductCardClient from './productCardClient';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Calculate all static data on the server
  const price = product.variants[0].price;
  const compareAtPrice = product.variants[0].compareAtPrice;
  const hasDiscount = compareAtPrice && compareAtPrice > price;

  // Build badges on server (SEO-friendly, deterministic)
  const badges = [...(product.badges || [])];
  if (hasDiscount) {
    const discountPercent = Math.round(
      ((compareAtPrice! - price) / compareAtPrice!) * 100
    );
    badges.push({ text: `Save ${discountPercent}%`, type: 'sale' });
  }
  if (product.tags.includes('Unisex'))
    badges.push({ text: 'Unisex', type: 'category' });
  if (product.tags.includes('Buy 2 Get 1'))
    badges.push({ text: 'Buy 2 Get 1', type: 'feature' });
  if (product.tags.includes('Buy 1 Get 1'))
    badges.push({ text: 'Buy 1 Get 1', type: 'feature' });
  if (product.variants.every((v) => !v.available))
    badges.push({ text: 'Sold Out', type: 'soldout' });

  const leftBadges = badges.filter(
    (b) => b.type === 'sale' || b.type === 'soldout'
  );
  const rightBadges = badges.filter(
    (b) => b.type !== 'sale' && b.type !== 'soldout'
  );

  // Determine initial image on server for SEO
  const getInitialImage = () => {
    const firstAvailableVariant = product.variants.find((v) => v.available);
    if (firstAvailableVariant) {
      const variantImage = product.images.find((img) =>
        img.variantIds.includes(firstAvailableVariant.shopifyId)
      );
      if (variantImage) return variantImage;
    }
    return product.images[0];
  };

  const initialImage = getInitialImage();

  // Pass everything to client component
  return (
    <ProductCardClient
      product={product}
      initialImage={initialImage}
      leftBadges={leftBadges}
      rightBadges={rightBadges}
      hasDiscount={hasDiscount ? hasDiscount : false}
      price={price}
      compareAtPrice={compareAtPrice}
    />
  );
}
