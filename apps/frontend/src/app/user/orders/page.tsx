import { Metadata } from 'next';
import OrdersContainer from './_components/ordersContainer';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Orders - Account',
  };
}

export interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  ProductVariant: {
    id: number;
    title: string;
    option1: string | null;
    option2: string | null;
    option3: string | null;
    image: { src: string; alt: string | null } | null;
    product: {
      title: string;
    };
  } | null;
}

export interface Order {
  id: number;
  status: string;
  totalAmount: number;
  createdAt: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  orderItems: OrderItem[];
}

export default function Page() {
  return (
    <main className="flex flex-col gap-6">
      <OrdersContainer />
    </main>
  );
}
