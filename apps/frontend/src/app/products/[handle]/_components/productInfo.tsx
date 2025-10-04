'use client';

import { useState, useMemo } from 'react';
import { Minus, Plus, Ruler } from 'lucide-react';
import { mapNameToHex } from '@/utils/mapNameToHex';

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
  variants: Variant[];
  options: Option[];
}

interface ProductInfoProps {
  product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
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

  // Find the selected variant based on color and size
  const selectedVariant = useMemo(() => {
    return product.variants.find(
      (v) => v.option1 === selectedColor && v.option2 === selectedSize
    );
  }, [product.variants, selectedColor, selectedSize]);

  // Get price information from selected variant or first variant
  const currentVariant = selectedVariant || product.variants[0];
  const price = parseFloat(currentVariant.price);
  const compareAtPrice = parseFloat(currentVariant.compareAtPrice);
  const discount =
    compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : 0;

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
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
            {colors.map((color) => (
              <button
                key={color.name}
                onClick={() => setSelectedColor(color.name)}
                style={getColorStyle(color.hex)}
                className={`h-8 w-8 rounded-full border-2 ${
                  selectedColor === color.name
                    ? 'border-black ring-2 ring-black ring-offset-2'
                    : 'border-gray-300'
                }`}
                aria-label={`Select ${color.name} color`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Size Picker */}
      {sizes.length > 0 && (
        <div>
          <p className="text-md text-muted-foreground font-medium">Size:</p>
          <div className="mt-2 flex gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`flex h-12 items-center justify-center rounded-3xl border-2 px-6 transition-colors ${
                  selectedSize === size
                    ? 'border-black bg-black text-white'
                    : 'border-gray-300 hover:bg-gray-100'
                }`}
              >
                {size}
              </button>
            ))}
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
        <div className="text-sm text-red-600">
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
          className="bg-foreground hover:bg-foreground/80 flex-1 rounded-3xl py-3 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!selectedVariant || !selectedVariant.available}
        >
          Buy it now
        </button>
      </div>
    </div>
  );
}
