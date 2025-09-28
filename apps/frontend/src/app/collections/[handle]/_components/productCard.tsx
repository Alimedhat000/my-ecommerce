import Link from 'next/link';
import Image from 'next/image';
import React from 'react';

export default function ProductCard({ long }: { long: boolean }) {
  return (
    <article className="bg-background relative grid grid-rows-[auto_1fr_auto] overflow-hidden rounded-md">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex space-x-2">
        <span className="bg-destructive rounded-full px-2 py-1 text-xs font-semibold text-white">
          Save 25%
        </span>
        <span className="bg-brand-orange rounded-full px-2 py-1 text-xs font-semibold text-white">
          Unisex
        </span>
      </div>

      {/* Product Image + Quick Add */}
      <div className="group relative">
        <Link href="/products/test-nav">
          <Image
            src="/placeholder.webp"
            alt="Oversized R1 T-Shirt"
            width={400}
            height={500}
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
        <Link
          href="/collections/test-collection"
          className="text-sm text-gray-500"
        >
          Juvenile
        </Link>

        {/* Title & Pricing */}
        <div>
          <h3 className="font-semibold">
            <Link href="/products/test-nav">
              {!long
                ? 'Oversized R1 T-Shirt'
                : 'Oversizedddddddddd R1 T-Shirt  T-Shirt T-Shirt T-Shirt T-Shirt'}
            </Link>
          </h3>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-red-600">525.00 EGP</span>
            <span className="text-gray-400 line-through">700.00 EGP</span>
          </div>
        </div>

        {/* Variant Swatches */}
        <div className="flex items-center space-x-2">
          <span className="selected_color h-5 w-5 rounded-full border bg-white"></span>
          <span className="h-5 w-5 rounded-full bg-[#888]"></span>
          <span className="h-5 w-5 rounded-full border bg-[#ead8ab]"></span>
          <span className="unavailable_color h-5 w-5 rounded-full border bg-black"></span>
          <span className="text-muted-foreground flex h-6 w-6 items-center justify-center rounded-full border text-xs">
            +2
          </span>
        </div>
      </div>
    </article>
  );
}
