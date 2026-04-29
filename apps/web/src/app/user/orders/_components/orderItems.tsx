import { OrderItem } from '@/app/user/orders/page';
import OrderItemRow from './orderItemRow';

interface OrderItemsProps {
  items: OrderItem[];
}

export default function OrderItems({ items }: OrderItemsProps) {
  return (
    <div className="mt-4 space-y-3">
      {items.map((item) => (
        <OrderItemRow key={item.id} item={item} />
      ))}
    </div>
  );
}
