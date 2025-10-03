import { Metadata } from 'next';
import ProductGallery from './_components/productGallery';
import ProductInfo from './_components/productInfo';
import ProductReviews from './_components/productReviews';
import ProductSuggestions from './_components/productSuggestions';

interface ProductPageProps {
  params: { handle: string };
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  // In a real app, fetch product data here
  const productName = 'Salty Studios Limeted Polo';
  const productDescription = 'Premium quality polo shirt from Salty Studios';
  const productImage =
    'https://gonative.eg/cdn/shop/files/016A0432.jpg?v=1752142111&width=1200';

  return {
    title: `${productName}`,
    description: productDescription,
    openGraph: {
      title: productName,
      description: productDescription,
      images: [productImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: productName,
      description: productDescription,
      images: [productImage],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  // In a real app, fetch product data here based on params.handle
  const productData = {
    vendor: 'Sally',
    handle: params.handle,
    title: 'SALTY STUDIOS LIMITED POLO',
    price: 558.6,
    compareAtPrice: 799.0,
    images: [
      'https://gonative.eg/cdn/shop/files/016A0432.jpg?v=1752142111&width=1200',
      'https://gonative.eg/cdn/shop/files/016A0433.jpg?v=1752142111&width=1200',
      'https://gonative.eg/cdn/shop/files/016A0434.jpg?v=1752142111&width=1200',
      'https://gonative.eg/cdn/shop/files/016A0434.jpg?v=1752142111&width=1200',
      'https://gonative.eg/cdn/shop/files/016A0434.jpg?v=1752142111&width=1200',
      'https://gonative.eg/cdn/shop/files/016A0434.jpg?v=1752142111&width=1200',
      'https://gonative.eg/cdn/shop/files/016A0432.jpg?v=1752142111&width=1200',
      'https://gonative.eg/cdn/shop/files/016A0433.jpg?v=1752142111&width=1200',
      'https://gonative.eg/cdn/shop/files/016A0434.jpg?v=1752142111&width=1200',
      'https://gonative.eg/cdn/shop/files/016A0434.jpg?v=1752142111&width=1200',
      'https://gonative.eg/cdn/shop/files/016A0434.jpg?v=1752142111&width=1200',
      'https://gonative.eg/cdn/shop/files/016A0434.jpg?v=1752142111&width=1200',
      'https://gonative.eg/cdn/shop/files/016A0433.jpg?v=1752142111&width=1200',
      'https://gonative.eg/cdn/shop/files/016A0434.jpg?v=1752142111&width=1200',
      'https://gonative.eg/cdn/shop/files/016A0434.jpg?v=1752142111&width=1200',
      'https://gonative.eg/cdn/shop/files/016A0434.jpg?v=1752142111&width=1200',
      'https://gonative.eg/cdn/shop/files/016A0434.jpg?v=1752142111&width=1200',
    ],
    colors: [
      { name: 'Grey', value: 'bg-gray-300' },
      { name: 'Yellow', value: 'bg-yellow-200' },
      { name: 'Black', value: 'bg-black' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    completeTheOutfit: {
      title: '9004 Denim',
      price: 1200.0,
      image: '/placeholder-outfit.jpg',
    },
  };

  // Preload critical images
  const preloadImages = productData.images.slice(0, 3);

  return (
    <>
      {/* Preload critical images for better performance */}
      {preloadImages.map((img, idx) => (
        <link
          key={idx}
          rel="preload"
          as="image"
          href={img}
          fetchPriority={idx === 0 ? 'high' : 'low'}
        />
      ))}

      <main className="mb-20">
        {/* Product Section */}
        <section className="grid-rows-auto grid grid-cols-1 items-start gap-x-12 gap-y-10 p-12 lg:grid-cols-2">
          <ProductGallery
            images={productData.images}
            title={productData.title}
          />
          <ProductInfo product={productData} />
        </section>

        <ProductReviews />
        <ProductSuggestions />
      </main>
    </>
  );
}
