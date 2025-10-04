import { Metadata } from 'next';
import ProductGallery from './_components/productGallery';
import ProductInfo from './_components/productInfo';
import ProductReviews from './_components/productReviews';
import ProductSuggestions from './_components/productSuggestions';
import { api } from '@/api/client';
import { ProductImage } from '@/types/collection';
import Image from 'next/image';
import React from 'react';

interface ProductPageProps {
  params: { handle: string };
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const handle = await params;
  const res = await api.get(`/products/handle/${handle.handle}`);
  const product = res.data.data;

  return {
    title: product.title,
    description:
      product.seoDescription ||
      product.bodyHtml ||
      `Premium quality ${product.title}`,
    openGraph: {
      title: product.title,
      description:
        product.seoDescription ||
        product.bodyHtml ||
        `Premium quality ${product.title}`,
      images: product.images.length > 0 ? [product.images[0].src] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description:
        product.seoDescription ||
        product.bodyHtml ||
        `Premium quality ${product.title}`,
      images: product.images.length > 0 ? [product.images[0].src] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const handle = await params;
  const res = await api.get(`/products/handle/${handle.handle}`);
  const product = res.data.data;

  return (
    <>
      <div style={{ display: 'none' }}>
        {product.images.slice(0, 3).map((img: ProductImage, index: number) => (
          <div key={img.id}>
            {/* Preload thumbnail size */}
            <Image
              src={img.src}
              alt="preload thumbnail"
              width={64}
              height={85}
              priority={index === 0}
            />
            {/* Preload gallery size */}
            <Image
              src={img.src}
              alt="preload gallery"
              width={900}
              height={1200}
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      <main className="mb-20">
        {/* Product Section */}
        <section className="grid-rows-auto grid grid-cols-1 items-start gap-x-12 gap-y-10 p-12 lg:grid-cols-2">
          <ProductGallery
            images={product.images.map((img: ProductImage) => img.src)}
            title={product.title}
          />
          <ProductInfo product={product} />
        </section>

        <ProductReviews />
        <ProductSuggestions />
      </main>
    </>
  );
}
