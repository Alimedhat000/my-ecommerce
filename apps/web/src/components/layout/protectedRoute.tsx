// components/ProtectedRoute.tsx
'use client';
import { useAuth } from '@/contexts/authContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const redirectUrl = encodeURIComponent(pathname);
      router.push(`/auth/login?redirect=${redirectUrl}`);
    }
  }, [isAuthenticated, loading, router, pathname]);

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;

  return <>{children}</>;
}
