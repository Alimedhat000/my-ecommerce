'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useCustomCursor } from '@/hooks/useCustomCursor';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { useClickNavigation } from '@/hooks/useClickNavigation';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [isMaxZoomed, setIsMaxZoomed] = useState(false);

  const [zoomOrigin, setZoomOrigin] = useState({ x: 0.5, y: 0.5 });

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isMaxZoomed) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      // Clamp values to prevent zooming outside image bounds
      const clampedX = Math.max(0, Math.min(1, x));
      const clampedY = Math.max(0, Math.min(1, y));

      setZoomOrigin({ x: clampedX, y: clampedY });
    }
    toggleMaxZoom();
  };

  const {
    currentIndex,
    nextItem,
    prevItem,
    goToItem,
    isCursorVisible,
    cursorPosition,
    isHovering,
    handleMouseEnter,
    handleMouseLeave,
    handleMouseMove: cursorHandleMouseMove,
  } = useCustomCursor({
    totalItems: images.length,
    initialIndex: 0,
  });

  const {
    handleClick,
    handleMouseMove: navHandleMouseMove,
    cursorSide,
  } = useClickNavigation({
    nextItem,
    prevItem,
    leftZonePercentage: 50,
    rightZonePercentage: 50,
  });

  // Combine both mouse move handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    cursorHandleMouseMove();
    navHandleMouseMove(e);
  };

  const openZoom = () => {
    setZoomIndex(currentIndex);
    setIsZoomed(true);
    document.body.style.overflow = 'hidden';
  };

  const closeZoom = () => {
    setIsZoomed(false);
    setIsMaxZoomed(false);
    document.body.style.overflow = '';
  };

  const nextZoomImage = () => {
    setZoomIndex((prev) => (prev + 1) % images.length);
    setIsMaxZoomed(false);
  };

  const prevZoomImage = () => {
    setZoomIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsMaxZoomed(false);
  };

  const toggleMaxZoom = () => {
    setIsMaxZoomed((prev) => !prev);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeZoom();
    } else if (e.key === 'ArrowLeft') {
      prevZoomImage();
    } else if (e.key === 'ArrowRight') {
      nextZoomImage();
    }
  };

  return (
    <>
      <CustomCursor
        isVisible={isCursorVisible && isHovering}
        position={cursorPosition}
        size={48}
        backgroundColor="rgba(255, 255, 255, 0.9)"
        borderColor="rgba(156, 163, 175, 0.8)"
        arrowColor="#374151"
        className=""
        cursorSide={cursorSide}
      />
      <div
        className="grid grid-cols-1 gap-x-10 gap-y-6 xl:grid-cols-[auto_minmax(0,1fr)]"
        onKeyDown={handleKeyDown}
      >
        {/* Thumbnails */}
        <div className="relative order-2 xl:max-h-[600px]">
          <div className="from-background pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r to-transparent xl:hidden" />
          <div className="from-background pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l to-transparent xl:hidden" />
          <div className="[:has(>div[data-scrollable]):not(:hover)>&] from-muted pointer-events-none absolute inset-x-0 top-0 z-10 hidden h-15 bg-gradient-to-b to-transparent xl:block" />
          <div className="[:has(>div[data-scrollable]):not(:hover)>&] from-muted pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden h-15 bg-gradient-to-t to-transparent xl:block" />

          <div
            className="grid max-h-[600px] auto-cols-[64px] grid-flow-col gap-[0.625rem] overflow-auto [-ms-overflow-style:none] [scrollbar-width:none] xl:grid-flow-row [&::-webkit-scrollbar]:hidden"
            data-scrollable
          >
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => goToItem(index)}
                className={`relative cursor-pointer overflow-hidden transition-opacity ${
                  currentIndex === index
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
        <div
          className="relative order-1 flex-1 cursor-none xl:order-2"
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
        >
          <div className="relative overflow-hidden rounded-2xl">
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
            {/* Zoom Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                openZoom();
              }}
              onMouseEnter={(e) => {
                e.stopPropagation();
                handleMouseLeave();
              }}
              onMouseLeave={(e) => {
                e.stopPropagation();
              }}
              className="bg-muted absolute right-6 bottom-10 z-20 cursor-pointer rounded-full p-5 transition-all"
              aria-label="Zoom image"
            >
              <ZoomIn className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>
      {/* Zoom Overlay */}
      {isZoomed && (
        <div
          className="bg-muted fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          onKeyDown={handleKeyDown}
          tabIndex={0}
          autoFocus
        >
          {/* Close Button */}
          <button
            onClick={closeZoom}
            className="border-ring absolute top-5 right-12 z-10 rounded-full border bg-white p-5 transition-all hover:bg-white/90"
            aria-label="Close zoom"
          >
            <X className="h-6 w-6 text-black" />
          </button>

          {/* Zoomed Image */}
          <div
            className={`relative flex h-full w-full items-center justify-center overflow-hidden`}
          >
            <Image
              src={images[zoomIndex]}
              alt={`${title} zoomed image ${zoomIndex + 1}`}
              width={1920}
              height={1080}
              onClick={handleImageClick}
              className={`max-h-full max-w-full object-contain transition-transform duration-500 ease-in-out ${isMaxZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
              style={{
                transform: isMaxZoomed ? 'scale(2)' : 'scale(1)',
                transformOrigin: `${zoomOrigin.x * 100}% ${zoomOrigin.y * 100}%`,
              }}
              priority
            />
          </div>

          {/* Navigation Bar with Counter */}
          <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-4 rounded-full bg-white px-4 py-2 shadow-lg">
            <button
              onClick={prevZoomImage}
              className="p-1 transition-all hover:scale-110"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </button>

            <span className="min-w-[4rem] text-center text-sm font-medium text-gray-700">
              {zoomIndex + 1} / {images.length}
            </span>

            <button
              onClick={nextZoomImage}
              className="p0 transition-all hover:scale-110"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-5 text-gray-700" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
