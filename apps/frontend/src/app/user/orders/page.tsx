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

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default async function Page({
  searchParams,
}: {
  searchParams: { page?: string; limit?: string };
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  return (
    <main className="flex flex-col gap-6">
      <OrdersContainer initialPage={page} initialLimit={limit} />
    </main>
  );
}
