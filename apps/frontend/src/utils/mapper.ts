// utils/mappers.ts
import {
  Product,
  ProductImage,
  ProductVariant,
  ProductCollection,
} from '@/types/collection';

export function mapServerProduct(serverData: any): Product {
  // Map images
  const images: ProductImage[] = serverData.images.map((img: any) => ({
    id: String(img.id),
    src: img.src,
    alt: img.alt ?? '',
    width: img.width,
    height: img.height,
  }));

  // Map variants
  const variants: ProductVariant[] = serverData.variants.map(
    (variant: any) => ({
      id: String(variant.id),
      title: variant.title,
      color: variant.option1, // assuming option1 is color
      colorName: variant.option1, // optional naming
      colorHex: undefined, // not provided by server
      available: variant.available,
      price: Number(variant.price),
      compareAtPrice: variant.compareAtPrice
        ? Number(variant.compareAtPrice)
        : undefined,
    })
  );

  // Map collections (if server sends them, otherwise leave empty)
  const collections: ProductCollection[] = serverData.collections
    ? serverData.collections.map((c: any) => ({
        handle: c.handle,
        title: c.title,
      }))
    : [];

  return {
    id: String(serverData.id),
    title: serverData.title,
    handle: serverData.handle,
    images,
    variants,
    collections,
    price: Number(variants[0]?.price ?? 0), // use first variant’s price as base
    compareAtPrice: variants[0]?.compareAtPrice
      ? Number(variants[0].compareAtPrice)
      : undefined,
    currency: 'USD', // server doesn’t provide, so set manually
    badges: [], // you can derive this later (sale, new, etc.)
  };
}
