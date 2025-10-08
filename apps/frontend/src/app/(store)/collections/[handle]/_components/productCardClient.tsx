'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Product,
  ProductImage,
  ProductBadge as badgeType,
} from '@/types/collection';
import VariantSwatches from './variantSwatches';
import ProductBadge from './productBadge';

interface ProductCardClientProps {
  product: Product;
  initialImage: ProductImage;
  leftBadges: badgeType[];
  rightBadges: badgeType[];
  hasDiscount: boolean | null;
  price: number;
  compareAtPrice: number | undefined;
}

const getImageUrl = (src: string) => {
  return src.includes('?') ? `${src}&width=800` : `${src}?width=800`;
};

const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.src = getImageUrl(src);
    img.onload = () => resolve();
    img.onerror = () => resolve();
  });
};

const preloadImages = (imageUrls: string[]): Promise<void[]> => {
  return Promise.all(imageUrls.map((url) => preloadImage(url)));
};

export default function ProductCardClient({
  product,
  initialImage,
  leftBadges,
  rightBadges,
  hasDiscount,
  price,
  compareAtPrice,
}: ProductCardClientProps) {
  // Use initialImage from server as default
  const [selectedImage, setSelectedImage] = useState(initialImage);
  const [displayedImage, setDisplayedImage] = useState(initialImage);
  const [nextImage, setNextImage] = useState<typeof initialImage | null>(null);
  const [fade, setFade] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(
    new Set([initialImage.src])
  );

  const handleSwatchClick = useCallback(
    async (img: typeof initialImage) => {
      if (img.src === displayedImage.src) return;

      setNextImage(img);

      const variantImageMap = new Map();
      product.variants.forEach((variant) => {
        const variantImage = product.images.find((image) =>
          image.variantIds.includes(variant.shopifyId)
        );
        if (variantImage) {
          variantImageMap.set(variant.shopifyId, variantImage.src);
        }
      });

      const uniqueVariantImageUrls = Array.from(variantImageMap.values());
      const imagesToPreload = uniqueVariantImageUrls.filter(
        (src) => !preloadedImages.has(src)
      );

      if (!preloadedImages.has(img.src)) {
        await preloadImage(img.src);
        setPreloadedImages((prev) => new Set([...prev, img.src]));
      }

      const otherImagesToPreload = imagesToPreload.filter(
        (src) => src !== img.src
      );
      if (otherImagesToPreload.length > 0) {
        preloadImages(otherImagesToPreload).then(() => {
          setPreloadedImages(
            (prev) => new Set([...prev, ...otherImagesToPreload])
          );
        });
      }

      requestAnimationFrame(() => {
        setFade(true);

        setTimeout(() => {
          setDisplayedImage(img);
          setSelectedImage(img);
          setNextImage(null);
          setFade(false);
        }, 300);
      });
    },
    [displayedImage, preloadedImages, product]
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

      {/* Image */}
      <div className="group relative aspect-[65/100] w-full overflow-hidden rounded-t-md">
        <Link
          href={`/products/${product.handle}`}
          className="relative block h-full w-full"
        >
          <div className="relative h-full w-full">
            <Image
              key={displayedImage.src}
              src={getImageUrl(displayedImage.src)}
              alt={displayedImage.alt ?? product.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={`object-cover transition-opacity duration-300 ${
                fade ? 'opacity-0' : 'opacity-100'
              }`}
              priority={true}
            />
            {nextImage && (
              <Image
                key={nextImage.src}
                src={getImageUrl(nextImage.src)}
                alt={nextImage.alt ?? product.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className={`absolute top-0 left-0 object-cover transition-opacity duration-300 ${
                  fade ? 'opacity-100' : 'opacity-0'
                }`}
                priority={true}
              />
            )}
          </div>
        </Link>
        <button className="absolute right-3 bottom-3 translate-y-2 transform rounded-full bg-black px-4 py-2 text-sm font-semibold text-white opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:opacity-80">
          + Quick add
        </button>
      </div>

      {/* Info */}
      <div className="grid grid-rows-[auto_1fr_auto] space-y-3 p-4">
        {product.vendor && (
          <div className="text-muted-foreground text-sm">{product.vendor}</div>
        )}

        <div>
          <h3 className="font-semibold">
            <Link href={`/products/${product.handle}`}>{product.title}</Link>
          </h3>
          <div className="flex items-center space-x-2">
            <span className={hasDiscount ? 'text-destructive' : ''}>
              {Number(price).toFixed(2)} EGP
            </span>
            {hasDiscount && compareAtPrice && (
              <span className="text-muted-foreground line-through">
                {Number(compareAtPrice).toFixed(2)} EGP
              </span>
            )}
          </div>
        </div>

        <VariantSwatches
          variants={product.variants}
          images={product.images}
          selectedImage={selectedImage}
          onSwatchClick={handleSwatchClick}
        />
      </div>
    </article>
  );
}
