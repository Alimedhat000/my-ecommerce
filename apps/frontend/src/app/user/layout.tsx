import { User, Package } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import LogoutButton from './_components/logoutButton';
import { ProtectedRoute } from '@/components/layout/protectedRoute';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="grid h-screen grid-rows-[auto_1fr] bg-[#F5F5F5]">
        <header className="grid grid-cols-[minmax(0,1fr)_minmax(auto,max-content)] items-center gap-8 bg-[#EDEDED]">
          <div className="flex items-center">
            <Link href={'/'}>
              <Image
                src="/logo_orange.svg"
                alt="Site Logo"
                width={90}
                height={30}
                priority
              />
            </Link>
          </div>

          <div className="flex gap-6">
            <Link href={'./orders'}>
              <Package />
            </Link>

            <Link href={'./profile'}>
              <User />
            </Link>
            <LogoutButton />
          </div>
        </header>

        <>{children}</>
      </div>
    </ProtectedRoute>
  );
}
