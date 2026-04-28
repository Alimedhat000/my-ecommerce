import { Metadata } from 'next';
import ProductReviews from './_components/productReviews';
import ProductSuggestions from './_components/productSuggestions';
import { api } from '@/api/client';
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

  return (
    <>
      <main className="mb-20">
        {/* Product Section */}
        <ProductView product={product} />
        <ProductReviews />
        <ProductSuggestions />
      </main>
    </>
  );
}
