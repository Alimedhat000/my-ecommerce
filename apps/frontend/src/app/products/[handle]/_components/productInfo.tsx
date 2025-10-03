'use client';

import { useState } from 'react';
import { Minus, Plus, Ruler } from 'lucide-react';
import Image from 'next/image';

interface ProductInfoProps {
  product: {
    vendor: string;
    title: string;
    price: number;
    compareAtPrice: number;
    colors: Array<{ name: string; value: string }>;
    sizes: string[];
    completeTheOutfit: {
      title: string;
      price: number;
      image: string;
    };
  };
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0].name);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  const discount = Math.round(
    ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
  );

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

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
          {product.price.toFixed(2)} EGP
        </span>
        <span className="text-muted-foreground ml-2 line-through">
          {product.compareAtPrice.toFixed(2)} EGP
        </span>
        <span className="bg-brand-orange ml-2 rounded-3xl px-2 py-0.5 text-sm text-white">
          Save {discount}%
        </span>
      </div>

      {/* Size Chart */}
      <div className="text-foreground text-md flex gap-2">
        <button className="hover:underline">Size Chart</button>
        <Ruler />
      </div>

      {/* Color Picker */}
      <div>
        <p className="text-md font-medium">
          <span className="text-muted-foreground">Color:</span> {selectedColor}
        </p>
        <div className="mt-2 flex gap-3">
          {product.colors.map((color) => (
            <button
              key={color.name}
              onClick={() => setSelectedColor(color.name)}
              className={`h-8 w-8 rounded-full border-2 ${color.value} ${selectedColor === color.name
                  ? 'border-black ring-2 ring-black ring-offset-2'
                  : 'border-gray-300'
                }`}
              aria-label={`Select ${color.name} color`}
            />
          ))}
        </div>
      </div>

      {/* Size Picker */}
      <div>
        <p className="text-md text-muted-foreground font-medium">Size:</p>
        <div className="mt-2 flex gap-2">
          {product.sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`flex h-12 items-center justify-center rounded-3xl border-2 px-6 transition-colors ${selectedSize === size
                  ? 'border-black bg-black text-white'
                  : 'border-gray-300 hover:bg-gray-100'
                }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

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

      {/* Buy Buttons */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <button className="bg-brand-orange hover:bg-brand-orange/80 flex-1 rounded-4xl py-4 text-white transition-colors">
          Add to cart
        </button>
        <button className="bg-foreground hover:bg-foreground/80 flex-1 rounded-3xl py-3 text-white transition-colors">
          Buy it now
        </button>
      </div>

      {/* Complete The Outfit Section */}
      <div className="mt-8 rounded-xl border-t bg-white p-4 pt-6">
        <h3 className="mb-4 text-lg font-medium">Complete The Outfit</h3>
        <div className="flex items-center gap-4 rounded-lg border p-4">
          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-gray-200">
            <Image
              src={product.completeTheOutfit.image}
              alt={product.completeTheOutfit.title}
              width={64}
              height={64}
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <p className="font-medium">{product.completeTheOutfit.title}</p>
            <p className="text-gray-600">
              {product.completeTheOutfit.price.toFixed(2)} EGP
            </p>
          </div>
          <button className="rounded bg-black px-4 py-2 text-sm text-white transition-colors hover:bg-gray-800">
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
