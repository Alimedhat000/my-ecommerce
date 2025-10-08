import { Metadata } from 'next';
import ProductReviews from './_components/productReviews';
import ProductSuggestions from './_components/productSuggestions';
import { api } from '@/api/client';
import { ProductImage } from '@/types/collection';
import Image from 'next/image';
import React from 'react';
import { ProductView } from './_components/productView';

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
  // console.log(product);

  return (
    <>
      <div style={{ display: 'none' }}>
        {product.images.slice(0, 3).map((img: ProductImage) => (
          <div key={img.id}>
            {/* Preload thumbnail size */}
            <Image
              src={img.src}
              alt="preload thumbnail"
              width={64}
              height={85}
              priority
            />
            {/* Preload gallery size */}
            <Image
              src={img.src}
              alt="preload gallery"
              width={900}
              height={1200}
              priority
            />
          </div>
        ))}
      </div>

      <main className="mb-20">
        {/* Product Section */}
        <ProductView product={product} />
        <ProductReviews />
        <ProductSuggestions />
      </main>
    </>
  );
}
