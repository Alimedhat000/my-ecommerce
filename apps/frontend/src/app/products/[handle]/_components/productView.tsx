'use client';

import { ProductImage } from '@/types/collection';
import ProductGallery from './productGallery';
import ProductInfo from './productInfo';
import { useState } from 'react';

export const ProductView = ({ product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleColorChange = (color: string, imageIndex: number) => {
    // Update the gallery to show the first image of the selected color
    setCurrentImageIndex(imageIndex);
  };

  return (
    <section className="grid-rows-auto grid grid-cols-1 items-start gap-x-12 gap-y-10 p-12 lg:grid-cols-2">
      <ProductGallery
        images={product.images.map((img: ProductImage) => img.src)}
        title={product.title}
        currentIndex={currentImageIndex}
        onIndexChange={setCurrentImageIndex}
      />
      <ProductInfo product={product} onColorChange={handleColorChange} />
    </section>
  );
};
