'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-6 xl:grid-cols-[auto_minmax(0,1fr)]">
      {/* Thumbnails - Left on desktop, bottom on mobile */}
      <div className="relative order-2">
        {/* Fade effects that respond to scroll direction */}
        <div className="from-background pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r to-transparent xl:hidden" />
        <div className="from-background pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l to-transparent xl:hidden" />

        {/* Vertical scroll gradients (desktop) - Only show when content overflows */}
        <div className="[:has(>div[data-scrollable]):not(:hover)>&] from-muted pointer-events-none absolute inset-x-0 top-0 z-10 hidden h-15 bg-gradient-to-b to-transparent xl:block" />
        <div className="[:has(>div[data-scrollable]):not(:hover)>&] from-muted pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden h-15 bg-gradient-to-t to-transparent xl:block" />

        <div
          className="grid max-h-[600px] auto-cols-[64px] grid-flow-col gap-[0.625rem] overflow-auto [-ms-overflow-style:none] [scrollbar-width:none] xl:grid-flow-row [&::-webkit-scrollbar]:hidden"
          data-scrollable
        >
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`relative cursor-pointer overflow-hidden transition-opacity ${currentIndex === index
                  ? 'after:absolute after:bottom-0 after:left-0 after:block after:h-[2px] after:w-full after:rounded-2xl after:bg-black after:content-[""]'
                  : ''
                }`}
            >
              <Image
                src={image}
                alt={`${title} thumbnail ${index + 1}`}
                width={64}
                height={85}
                className="mb-1 rounded-md object-cover"
                loading={index < 4 ? 'eager' : 'lazy'}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Main Image Carousel */}
      <div className="relative order-1 flex-1 xl:order-2">
        <div className="overflow-hidden rounded-2xl">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {images.map((image, index) => (
              <div key={index} className="min-w-full">
                <Image
                  src={image}
                  alt={`${title} image ${index + 1}`}
                  width={900}
                  height={1200}
                  className="h-full w-full object-cover"
                  priority={index === 0}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
