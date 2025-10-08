import { cn } from '@/lib/utils';
import Image from 'next/image';

interface CartProductItemProps {
  item: {
    variantId: string;
    image: string;
    title: string;
    price: number;
    variantTitle: string;
    quantity?: number;
  };
  updateQuantity?: (variantId: string, newQuantity: number) => void;
  removeItem?: (variantId: string) => void;
  className?: string;
}

export function CartProductItem({
  item,
  updateQuantity,
  removeItem,
  className,
}: CartProductItemProps) {
  const hasControls = updateQuantity && removeItem;

  return (
    <div
      key={item.variantId}
      className={cn(`flex items-center gap-4 border-b pb-4`, `${className}`)}
    >
      <Image
        src={item.image}
        alt={item.title}
        width={96}
        height={144}
        className="rounded-md object-cover"
        priority
      />

      <div className="grid w-full grid-cols-1 sm:grid-cols-2">
        {/* Product details */}
        <div className="grid w-full justify-start">
          <h3 className="text-start font-medium">{item.title}</h3>
          <div className="mt-2 flex items-center justify-between font-light text-[#4a4a4a]">
            {item.price.toFixed(2)} EGP
          </div>
          <p className="text-start text-sm font-light text-[#4a4a4a]">
            {item.variantTitle}
          </p>

          {/* Mobile controls */}
          {hasControls && (
            <div className="mt-5 flex w-full items-center gap-4 sm:hidden">
              <div className="flex items-center">
                <button
                  onClick={() =>
                    updateQuantity(
                      item.variantId,
                      Math.max(1, (item.quantity ?? 1) - 1)
                    )
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 transition-colors hover:bg-gray-50 active:bg-gray-100"
                  disabled={(item.quantity ?? 1) <= 1}
                >
                  <span className="text-lg leading-none">−</span>
                </button>
                <span className="min-w-8 text-center font-medium">
                  {item.quantity ?? 1}
                </span>
                <button
                  onClick={() =>
                    updateQuantity(item.variantId, (item.quantity ?? 1) + 1)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 transition-colors hover:bg-gray-50 active:bg-gray-100"
                >
                  <span className="text-lg leading-none">+</span>
                </button>
              </div>

              <button
                className="text-muted-foreground flex-shrink-0 text-xs underline sm:text-sm"
                onClick={() => removeItem(item.variantId)}
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Desktop controls */}
        {hasControls && (
          <div className="hidden flex-col items-end gap-3 justify-self-end sm:flex">
            <button
              className="text-muted-foreground flex-shrink-0 text-xs underline sm:text-sm"
              onClick={() => removeItem(item.variantId)}
            >
              Remove
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  updateQuantity(
                    item.variantId,
                    Math.max(1, (item.quantity ?? 1) - 1)
                  )
                }
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 transition-colors hover:bg-gray-50 active:bg-gray-100"
                disabled={(item.quantity ?? 1) <= 1}
              >
                <span className="text-lg leading-none">−</span>
              </button>
              <span className="min-w-8 text-center font-medium">
                {item.quantity ?? 1}
              </span>
              <button
                onClick={() =>
                  updateQuantity(item.variantId, (item.quantity ?? 1) + 1)
                }
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 transition-colors hover:bg-gray-50 active:bg-gray-100"
              >
                <span className="text-lg leading-none">+</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
