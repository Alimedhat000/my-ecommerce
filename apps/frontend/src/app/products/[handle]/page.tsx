import { Minus, Plus, Ruler } from 'lucide-react';

interface ProductPageProps {
  params: { handle: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const productImages = [
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
  ];

  return (
    <main className="mb-20">
      {/* Product Section */}
      <section className="grid-rows-auto grid grid-cols-1 items-start gap-x-12 gap-y-10 p-12 lg:grid-cols-2">
        {/* Product Gallery */}
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
              {productImages.map((image, index) => (
                <button
                  key={index}
                  className="mb-[2px] cursor-pointer overflow-hidden rounded-md"
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    width={64}
                    height={85}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Main Image Carousel */}
          <div className="relative order-1 flex-1 xl:order-2">
            {/* Image Carousel */}
            <div className="grid-rows-auto grid auto-cols-[100%] grid-flow-col gap-6 overflow-hidden rounded-2xl">
              <div>
                <img
                  src={productImages[0]}
                  alt="Main product image"
                  className="h-full w-[900px] object-cover"
                />
              </div>
              <div>
                <img
                  src={productImages[0]}
                  alt="Main product image"
                  className="h-full w-[900px] object-cover"
                />
              </div>
              <div>
                <img
                  src={productImages[0]}
                  alt="Main product image"
                  className="h-full w-[900px] object-cover"
                />
              </div>
              <div>
                <img
                  src={productImages[0]}
                  alt="Main product image"
                  className="h-full w-[900px] object-cover"
                />
              </div>
            </div>
            {/* Main Image */}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-6">
          {/* Vendor & Title */}
          <div>
            <p className="text-muted-foreground text-sm">Sally</p>
            <h1 className="header text-4xl">SALTY STUDIOS LIMITED POLO</h1>
          </div>

          {/* Price */}
          <div className="border-b-2 pb-10">
            <span className="text-brand-orange text-xl font-bold">
              558.60 EGP
            </span>
            <span className="text-muted-foreground ml-2 line-through">
              799.00 EGP
            </span>
            <span className="bg-brand-orange ml-2 rounded-3xl px-2 py-0.5 text-sm text-white">
              Save 30%
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
              <span className="text-muted-foreground">Color:</span> Grey
            </p>
            <div className="mt-2 flex gap-3">
              <button className="h-8 w-8 rounded-full border-2 border-black bg-gray-300" />
              <button className="h-8 w-8 rounded-full border-2 border-gray-300 bg-yellow-200" />
              <button className="h-8 w-8 rounded-full border-2 border-gray-300 bg-black" />
            </div>
          </div>

          {/* Size Picker */}
          <div>
            <p className="text-md text-muted-foreground font-medium">Size:</p>
            <div className="mt-2 flex gap-2">
              {['S', 'M', 'L', 'XL'].map((size) => (
                <button
                  key={size}
                  className="flex h-12 items-center justify-center rounded-3xl border-2 px-6 transition-colors hover:bg-gray-100"
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
              <button className="rounded-full p-3">
                <Minus size={20} /> {/* Lucide uses 'size' prop */}
              </button>
              <span className="mx-2 min-w-8 text-center font-medium">1</span>
              <button className="rounded-full p-3">
                <Plus size={20} /> {/* Lucide uses 'size' prop */}
              </button>
            </div>
          </div>

          {/* Buy Buttons */}
          <div className="mt-4 flex gap-4">
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
              <div className="h-16 w-16 flex-shrink-0 rounded bg-gray-200"></div>
              <div className="flex-1">
                <p className="font-medium">9004 Denim</p>
                <p className="text-gray-600">1,200.00 EGP</p>
              </div>
              <button className="rounded bg-black px-4 py-2 text-sm text-white transition-colors hover:bg-gray-800">
                Add
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Product Review Section */}
      <section className="container mx-auto mt-20">
        <h2 className="mb-4 text-xl font-semibold">Reviews</h2>
        <div className="rounded p-6">Review list goes here</div>
      </section>

      {/* Product Suggestions Section */}
      <section className="container mx-auto mt-20">
        <h2 className="mb-4 text-xl font-semibold">You may also like</h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map((_, i) => (
            <div
              key={i}
              className="flex h-40 items-center justify-center rounded bg-gray-100"
            >
              Product {i + 1}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
