import { User, Package } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid h-screen grid-rows-[auto_1fr] bg-[#F5F5F5]">
      <header className="grid grid-cols-[minmax(0,1fr)_minmax(auto,max-content)] items-center gap-8 bg-[#EDEDED]">
        <Link href={'/'}>
          <Image
            src="/logo_orange.svg"
            alt="Site Logo"
            width={90}
            height={30}
            priority
          />
        </Link>

        <div className="flex gap-6">
          <Link href={'./orders'}>
            <Package />
          </Link>

          <Link href={'./profile'}>
            <User />
          </Link>
        </div>
      </header>

      <>{children}</>
    </div>
  );
}
