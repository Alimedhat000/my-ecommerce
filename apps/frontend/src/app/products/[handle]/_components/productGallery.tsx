'use client';

import Image from 'next/image';
import { useCustomCursor } from '@/hooks/useCustomCursor';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { useClickNavigation } from '@/hooks/useClickNavigation';

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
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

      <div className="grid grid-cols-1 gap-x-10 gap-y-6 xl:grid-cols-[auto_minmax(0,1fr)]">
        {/* Thumbnails */}
        <div className="relative order-2">
          <div className="from-background pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r to-transparent xl:hidden" />
          <div className="from-background pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l to-transparent xl:hidden" />
          <div className="[:has(>div[data-scrollable]):not(:hover)>&] from-muted pointer-events-none absolute inset-x-0 top-0 z-10 hidden h-15 bg-gradient-to-b to-transparent xl:block" />
          <div className="[:has(>div[data-scrollable]):not(:hover)>&] from-muted pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden h-15 bg-gradient-to-t to-transparent xl:block" />

          <div
            className="grid max-h-[700px] auto-cols-[64px] grid-flow-col gap-[0.625rem] overflow-auto [-ms-overflow-style:none] [scrollbar-width:none] xl:grid-flow-row [&::-webkit-scrollbar]:hidden"
            data-scrollable
          >
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => goToItem(index)}
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
        <div
          className="relative order-1 flex-1 cursor-none xl:order-2"
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
        >
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
    </>
  );
}
