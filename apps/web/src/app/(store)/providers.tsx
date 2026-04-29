'use client';

import { CartProvider } from '@/contexts/cartContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  // keep a stable client instance
  const [queryClient] = useState(() => new QueryClient());

  return (
    <CartProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </CartProvider>
  );
}
