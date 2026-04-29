import { Order } from '@/app/user/orders/page';
import OrderHeader from './orderHeader';
import OrderItems from './orderItems';
import OrderFooter from './orderFooter';

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <OrderHeader
        id={order.id}
        status={order.status}
        createdAt={order.createdAt}
        totalAmount={order.totalAmount}
      />
      <OrderItems items={order.orderItems} />
      <OrderFooter
        orderId={order.id}
        address={order.address}
        status={order.status}
      />
    </div>
  );
}
