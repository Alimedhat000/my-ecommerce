import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/collection';
import ProductBadge from './productBadge';
import VariantSwatches from './variantSwatches';

interface ProductCardProps {
  product: Product;
}

const getImageUrl = (src: string) => {
  return src.includes('?') ? `${src}&width=800` : `${src}?width=800`;
};

// Preload a single image
const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.src = getImageUrl(src);
    img.onload = () => resolve();
    img.onerror = () => resolve(); // Resolve even on error to avoid blocking
  });
};

// Preload multiple images
const preloadImages = (imageUrls: string[]): Promise<void[]> => {
  return Promise.all(imageUrls.map((url) => preloadImage(url)));
};

export default function ProductCard({ product }: ProductCardProps) {
  // Initialize with null and set in useEffect to avoid hydration mismatch
  const [selectedImage, setSelectedImage] = useState<
    (typeof product.images)[0] | null
  >(null);
  const [displayedImage, setDisplayedImage] = useState<
    (typeof product.images)[0] | null
  >(null);
  const [nextImage, setNextImage] = useState<(typeof product.images)[0] | null>(
    null
  );
  const [fade, setFade] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(
    new Set()
  );

  // Calculate badges - this is safe as it's deterministic
  const price = product.variants[0].price;
  const compareAtPrice = product.variants[0].compareAtPrice;
  const hasDiscount = compareAtPrice && compareAtPrice > price;

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

  // Initialize images after component mounts (client-side only)
  useEffect(() => {
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
    setSelectedImage(initialImage);
    setDisplayedImage(initialImage);
    setPreloadedImages(new Set([initialImage.src]));
  }, [product.images, product.variants]);

  const handleSwatchClick = useCallback(
    async (img: (typeof product.images)[0]) => {
      if (!displayedImage || img.src === displayedImage.src) return;

      setNextImage(img);

      // Create a map of variant IDs to their primary images
      const variantImageMap = new Map();
      product.variants.forEach((variant) => {
        const variantImage = product.images.find((img) =>
          img.variantIds.includes(variant.shopifyId)
        );
        if (variantImage) {
          variantImageMap.set(variant.shopifyId, variantImage.src);
        }
      });

      // Get unique variant image URLs
      const uniqueVariantImageUrls = Array.from(variantImageMap.values());

      // Filter out already preloaded images
      const imagesToPreload = uniqueVariantImageUrls.filter(
        (src) => !preloadedImages.has(src)
      );

      // Preload current image first if needed
      if (!preloadedImages.has(img.src)) {
        await preloadImage(img.src);
        setPreloadedImages((prev) => new Set([...prev, img.src]));
      }

      // Preload other variant images in the background
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

      // Use a small timeout to ensure the DOM updates before starting the fade
      requestAnimationFrame(() => {
        setFade(true);

        setTimeout(() => {
          setDisplayedImage(img);
          setSelectedImage(img);
          setNextImage(null);
          setFade(false);
        }, 300); // transition duration
      });
    },
    [displayedImage, preloadedImages, product]
  );

  // Don't render images until client-side initialization
  if (!selectedImage || !displayedImage) {
    return (
      <article className="bg-background relative grid grid-rows-[auto_1fr_auto] overflow-hidden rounded-md">
        {/* Skeleton loader */}
        <div className="aspect-[65/100] w-full animate-pulse rounded-t-md bg-gray-200" />
        <div className="space-y-3 p-4">
          <div className="h-4 animate-pulse rounded bg-gray-200" />
          <div className="h-6 animate-pulse rounded bg-gray-200" />
        </div>
      </article>
    );
  }

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
            {/* Displayed image */}
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
            {/* Next image (fades in) */}
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
        {/* Vendor */}
        {product.vendor && (
          <div className="text-muted-foreground text-sm">{product.vendor}</div>
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
