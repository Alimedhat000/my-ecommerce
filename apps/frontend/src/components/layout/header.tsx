import Image from 'next/image';
import { ChevronDown, Search, ShoppingBag, User } from 'lucide-react';
import React from 'react';

export default function Header({ isHome }: { isHome: boolean }) {
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
          <li className="cursor-pointer">
            <User className="h-5 w-5" />
            <span className="sr-only">Account</span>
          </li>
          <li className="relative cursor-pointer">
            <ShoppingBag className="h-5 w-5" />
            <span className="sr-only">Cart</span>
            {/* Cart badge */}
            <span className="bg-foreground text-background absolute -top-2 -right-2 rounded-full px-1.5 py-0.5 text-xs">
              2
            </span>
          </li>
        </ul>
      </div>
    </header>
  );
}
