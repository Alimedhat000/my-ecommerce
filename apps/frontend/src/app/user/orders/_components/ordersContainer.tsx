'use client';

import { useEffect, useState } from 'react';
import { api } from '@/api/client';
import { Order, Pagination } from '../page';
import OrdersList from './ordersList';
import EmptyOrders from './emptyOrders';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import OrdersPagination from './orderPagination';

function OrdersLoading() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-gray-200"></div>
        <div className="h-5 w-20 animate-pulse rounded-lg bg-gray-200"></div>
      </div>
      <div className="flex flex-col gap-5">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4">
              <div className="flex flex-col gap-2">
                <div className="h-6 w-40 animate-pulse rounded-lg bg-gray-200"></div>
                <div className="h-4 w-32 animate-pulse rounded-lg bg-gray-200"></div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="h-4 w-16 animate-pulse rounded-lg bg-gray-200"></div>
                <div className="h-7 w-24 animate-pulse rounded-lg bg-gray-200"></div>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {[1, 2].map((j) => (
                <div key={j} className="flex gap-4">
                  <div className="h-16 w-16 animate-pulse rounded-lg bg-gray-200"></div>
                  <div className="flex flex-1 flex-col justify-center gap-2">
                    <div className="h-5 w-48 animate-pulse rounded-lg bg-gray-200"></div>
                    <div className="h-4 w-32 animate-pulse rounded-lg bg-gray-200"></div>
                  </div>
                  <div className="flex items-center">
                    <div className="h-6 w-16 animate-pulse rounded-lg bg-gray-200"></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
              <div className="flex flex-col gap-2">
                <div className="h-4 w-24 animate-pulse rounded-lg bg-gray-200"></div>
                <div className="h-4 w-56 animate-pulse rounded-lg bg-gray-200"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-9 w-28 animate-pulse rounded-lg bg-gray-200"></div>
                <div className="h-9 w-28 animate-pulse rounded-lg bg-gray-200"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

interface OrdersContainerProps {
  initialPage: number;
  initialLimit: number;
}

export default function OrdersContainer({
  initialPage,
  initialLimit,
}: OrdersContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentPage = Number(searchParams.get('page')) || initialPage;
  const currentLimit = Number(searchParams.get('limit')) || initialLimit;

  useEffect(() => {
    async function fetchOrders() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get('/user/orders', {
          params: {
            page: currentPage,
            limit: currentLimit,
          },
        });

        setOrders(response.data.orders);
        setPagination(response.data.pagination);
        console.log(response.data);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Failed to load orders. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, [currentPage, currentLimit]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };

  if (isLoading) {
    return <OrdersLoading />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-14 text-center">
        <h2 className="text-lg font-medium text-red-900">Error</h2>
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 rounded-lg bg-red-600 px-6 py-2 text-white transition hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Orders</h1>
        {pagination && (
          <span className="text-sm text-gray-500">
            {pagination.total} order{pagination.total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {orders.length === 0 && pagination ? (
        <>
          <EmptyOrders />
          <OrdersPagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <>
          <OrdersList orders={orders} />
          {pagination && pagination.totalPages > 1 && (
            <OrdersPagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </>
  );
}
