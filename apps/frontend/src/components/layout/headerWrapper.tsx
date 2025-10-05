'use client';

import { usePathname } from 'next/navigation';
import Header from './header';

export default function HeaderWrapper() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return <Header isHome={isHome} />;
}
