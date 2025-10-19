import Image from 'next/image';
import { OrderItem } from '@/app/user/orders/page';

interface OrderItemRowProps {
  item: OrderItem;
}

export default function OrderItemRow({ item }: OrderItemRowProps) {
  const variantText =
    [
      item.ProductVariant?.option1,
      item.ProductVariant?.option2,
      item.ProductVariant?.option3,
    ]
      .filter(Boolean)
      .join(' / ') || 'Default';

  return (
    <div className="flex gap-4">
      <div className="h-auto w-18 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {item.ProductVariant?.image && (
          <Image
            src={item.ProductVariant.image.src}
            alt={item.ProductVariant.image.alt || ''}
            height={96}
            width={128}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col justify-center">
        <h4 className="font-medium text-gray-900">
          {item.ProductVariant?.product.title || 'Product'}
        </h4>
        <p className="text-sm text-gray-500">
          {variantText} · Price: {item.price}$ · Qty: {item.quantity}
        </p>
      </div>
      <div className="flex items-center">
        <p className="font-semibold text-gray-900">
          ${(item.price * item.quantity).toFixed(2)}
        </p>
      </div>
    </div>
  );
}
