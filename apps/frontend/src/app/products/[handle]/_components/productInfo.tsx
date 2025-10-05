'use client';

import { useState, useMemo } from 'react';
import { Minus, Plus, Ruler } from 'lucide-react';
import { mapNameToHex } from '@/utils/mapNameToHex';
import { ProductImage } from '@/types/collection';

interface Variant {
  id: number;
  shopifyId: string;
  title: string;
  sku: string;
  price: string;
  compareAtPrice: string;
  inventoryQty: number;
  available: boolean;
  option1: string | null; // Color
  option2: string | null; // Size
  option3: string | null;
  imageId: number;
  image: {
    src: string;
    alt: string | null;
  };
}

interface Option {
  id: number;
  name: string;
  position: number;
  values: string[];
}

interface Product {
  id: number;
  title: string;
  vendor: string;
  images: ProductImage[];
  variants: Variant[];
  options: Option[];
}

interface ProductInfoProps {
  product: Product;
  onColorChange?: (color: string, imageIndex: number) => void;
}

export default function ProductInfo({
  product,
  onColorChange,
}: ProductInfoProps) {
  // Extract unique colors and sizes from options
  const colorOption = product.options.find((opt) => opt.name === 'Color');
  const sizeOption = product.options.find((opt) => opt.name === 'Size');

  const colors = useMemo(() => {
    if (!colorOption) return [];

    return colorOption.values.map((colorName) => ({
      name: colorName,
      hex: mapNameToHex(colorName) || '#000000',
    }));
  }, [colorOption]);

  const sizes = sizeOption?.values || [];

  const [selectedColor, setSelectedColor] = useState(colors[0]?.name || '');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Get available variants for the selected color
  const availableVariantsForSelectedColor = useMemo(() => {
    return product.variants.filter(
      (v) => v.option1 === selectedColor && v.available
    );
  }, [product.variants, selectedColor]);

  // Check if a color has any available variants
  const isColorAvailable = useMemo(() => {
    const colorAvailability = new Map();
    colors.forEach((color) => {
      const hasAvailableVariant = product.variants.some(
        (v) => v.option1 === color.name && v.available
      );
      colorAvailability.set(color.name, hasAvailableVariant);
    });
    return colorAvailability;
  }, [colors, product.variants]);

  // Check if a specific size is available for the selected color
  const isSizeAvailable = (size: string) => {
    return availableVariantsForSelectedColor.some((v) => v.option2 === size);
  };

  // Find the selected variant based on color and size
  const selectedVariant = useMemo(() => {
    return product.variants.find(
      (v) => v.option1 === selectedColor && v.option2 === selectedSize
    );
  }, [product.variants, selectedColor, selectedSize]);

  // Get the first variant for each color to find associated images
  const colorVariants = useMemo(() => {
    const colorMap = new Map();
    product.variants.forEach((variant) => {
      if (variant.option1 && !colorMap.has(variant.option1)) {
        colorMap.set(variant.option1, variant);
      }
    });
    return colorMap;
  }, [product.variants]);

  // Get price information from selected variant or first available variant
  const currentVariant =
    selectedVariant ||
    availableVariantsForSelectedColor[0] ||
    product.variants[0];
  const price = currentVariant ? parseFloat(currentVariant.price) : 0;
  const compareAtPrice = currentVariant
    ? parseFloat(currentVariant.compareAtPrice)
    : 0;
  const discount =
    compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : 0;

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleColorChange = (colorName: string) => {
    if (!isColorAvailable.get(colorName)) return;

    setSelectedColor(colorName);
    setSelectedSize(''); // Reset size when color changes

    // Find the first variant with this color that has an image
    const colorVariant = colorVariants.get(colorName);

    if (colorVariant && colorVariant.image && onColorChange) {
      // Find the index of the image in the product.images array
      const imageIndex = product.images.findIndex(
        (img) => img.id === colorVariant.imageId
      );

      if (imageIndex !== -1) {
        onColorChange(colorName, imageIndex);
      }
    }
  };

  const handleSizeChange = (size: string) => {
    if (!isSizeAvailable(size)) return;
    setSelectedSize(size);
  };

  // Helper to convert hex to Tailwind-compatible style
  const getColorStyle = (hex: string) => ({ backgroundColor: hex });

  return (
    <div className="flex flex-col gap-6">
      {/* Vendor & Title */}
      <div>
        <p className="text-muted-foreground text-sm">{product.vendor}</p>
        <h1 className="header text-4xl">{product.title}</h1>
      </div>

      {/* Price */}
      <div className="border-b-2 pb-10">
        <span className="text-brand-orange text-xl font-bold">
          {price.toFixed(2)} EGP
        </span>
        {discount > 0 && (
          <>
            <span className="text-muted-foreground ml-2 line-through">
              {compareAtPrice.toFixed(2)} EGP
            </span>
            <span className="bg-brand-orange ml-2 rounded-3xl px-2 py-0.5 text-sm text-white">
              Save {discount}%
            </span>
          </>
        )}
      </div>

      {/* Size Chart */}
      <div className="text-foreground text-md flex gap-2">
        <button className="hover:underline">Size Chart</button>
        <Ruler />
      </div>

      {/* Color Picker */}
      {colors.length > 0 && (
        <div>
          <p className="text-md font-medium">
            <span className="text-muted-foreground">Color:</span>{' '}
            {selectedColor}
          </p>
          <div className="mt-2 flex gap-3">
            {colors.map((color) => {
              const isAvailable = isColorAvailable.get(color.name);
              const isSelected = selectedColor === color.name;

              return (
                <button
                  key={color.name}
                  onClick={() => handleColorChange(color.name)}
                  style={getColorStyle(color.hex)}
                  className={`relative h-8 w-8 rounded-full border-2 ${
                    isSelected
                      ? 'border-black ring-2 ring-black ring-offset-2'
                      : 'border-muted-foreground'
                  } ${
                    !isAvailable
                      ? 'ring-destructive cursor-not-allowed opacity-50 ring-2 ring-offset-2'
                      : 'cursor-pointer'
                  }`}
                  aria-label={`Select ${color.name} color`}
                  disabled={!isAvailable}
                  title={!isAvailable ? 'Out of stock' : `Select ${color.name}`}
                >
                  {/* Red X overlay for unavailable colors */}
                  {!isAvailable && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-destructive h-0.5 w-full origin-center rotate-45 transform"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size Picker */}
      {sizes.length > 0 && (
        <div>
          <p className="text-md text-muted-foreground font-medium">Size:</p>
          <div className="mt-2 flex gap-2">
            {sizes.map((size) => {
              const isAvailable = isSizeAvailable(size);
              const isSelected = selectedSize === size;

              return (
                <button
                  key={size}
                  onClick={() => handleSizeChange(size)}
                  className={`relative flex h-12 items-center justify-center rounded-3xl border-2 px-6 transition-colors ${
                    isSelected
                      ? 'border-black bg-black text-white'
                      : isAvailable
                        ? 'border-muted-foreground hover:bg-gray-100'
                        : 'border-muted-foreground opacity-50'
                  } ${
                    !isAvailable
                      ? 'ring- cursor-not-allowed ring-2 ring-offset-2'
                      : 'cursor-pointer'
                  }`}
                  disabled={!isAvailable}
                  title={!isAvailable ? 'Out of stock' : `Select ${size}`}
                >
                  {size}
                  {/* Red X overlay for unavailable sizes */}
                  {!isAvailable && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-3xl">
                      <div className="bg-destructive oriain-center h-0.5 w-3/4 rotate-45 transform"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity Picker */}
      <div>
        <p className="text-md text-muted-foreground mb-3 font-medium">
          Quantity:
        </p>
        <div className="inline-flex h-12 items-center justify-between rounded-3xl border-2 px-1">
          <button
            onClick={() => handleQuantityChange(-1)}
            className="rounded-full p-3 transition-colors hover:bg-gray-100"
            aria-label="Decrease quantity"
          >
            <Minus size={20} />
          </button>
          <span className="mx-2 min-w-8 text-center font-medium">
            {quantity}
          </span>
          <button
            onClick={() => handleQuantityChange(1)}
            className="rounded-full p-3 transition-colors hover:bg-gray-100"
            aria-label="Increase quantity"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Availability Notice */}
      {selectedVariant && !selectedVariant.available && (
        <div className="text-destructive text-sm">
          This variant is currently out of stock
        </div>
      )}

      {/* Buy Buttons */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <button
          className="bg-brand-orange hover:bg-brand-orange/80 flex-1 rounded-4xl py-4 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!selectedVariant || !selectedVariant.available}
        >
          Add to cart
        </button>
        <button
          className="bg-foreground hover:bg-foreground/80 flex-1 rounded-3xl py-4 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!selectedVariant || !selectedVariant.available}
        >
          Buy it now
        </button>
      </div>
    </div>
  );
}
