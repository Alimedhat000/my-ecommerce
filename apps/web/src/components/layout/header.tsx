import Image from 'next/image';
import { ChevronDown, Search, ShoppingBag, User } from 'lucide-react';
import React from 'react';
import { CartDrawer } from './drawers/cartDrawer';
import { useAuth } from '@/contexts/authContext';
import Link from 'next/link';

export default function Header({ isHome }: { isHome: boolean }) {
  const { isAuthenticated } = useAuth();
  return (
    <header
      className={`bg-background text-foreground border-t-foreground border-b-foreground header grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center border-b px-12 py-9 text-center ${isHome ? 'border-t' : 'dark'}`}
    >
      {/* Left Nav */}
      <div className="flex items-center justify-start">
        <nav>
          <ul className="flex gap-8 tracking-wide uppercase">
            <li className="group cursor-pointer">
              <div className="hover:text-foreground/70 flex items-center gap-1 transition-colors">
                Men{' '}
                <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
              </div>
            </li>
            <li className="group cursor-pointer">
              <div className="hover:text-foreground/70 flex items-center gap-1 transition-colors">
                Women{' '}
                <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
              </div>
            </li>
            {/* <li className="group cursor-pointer">
                <div className="hover:text-foreground/70 flex items-center gap-1 transition-colors">
                  Shop by Collections{' '}
                  <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
                </div>
              </li> */}
          </ul>
        </nav>
      </div>

      {/* Logo */}
      <div className="flex justify-center">
        {isHome ? (
          <Image
            src="/logo.svg"
            alt="Site Logo"
            width={100}
            height={30}
            priority
          />
        ) : (
          <Image
            src="/logo_dark.svg"
            alt="Site Logo"
            width={100}
            height={30}
            priority
          />
        )}
      </div>

      {/* Right Icons */}
      <div className="flex items-center justify-end">
        <ul className="flex items-center gap-6">
          <li className="cursor-pointer">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </li>
          <li className="relative cursor-pointer">
            <Link href="/user/profile">
              <User className="h-5 w-5" />
              {/* Green dot indicator */}
              {isAuthenticated && (
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-green-500"></span>
              )}
              <span className="sr-only">Account</span>
            </Link>
          </li>
          <CartDrawer>
            <li className="relative cursor-pointer">
              <ShoppingBag className="h-5 w-5" />
              <span className="sr-only">Cart</span>
            </li>
          </CartDrawer>
        </ul>
      </div>
    </header>
  );
}
