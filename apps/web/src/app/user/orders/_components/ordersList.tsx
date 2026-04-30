import { Order } from '@/app/user/orders/page';
import OrderCard from './orderCard';

interface OrdersListProps {
  orders: Order[];
}

export default function OrdersList({ orders }: OrdersListProps) {
  return (
    <div className="flex flex-col gap-5">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
