import { Facebook, Instagram, Twitter } from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-foreground text-background px-8 py-16 md:px-24">
      <div className="grid grid-cols-3 gap-16 lg:grid-cols-[350px_repeat(3,minmax(0,1fr))]">
        {/* Left Section */}
        <div className="col-span-4 space-y-8 lg:col-span-1">
          {/* Logo */}
          <div className="text-4xl font-bold tracking-wider">
            <Image
              src="/logo_dark.svg"
              alt="Site Logo"
              width={200}
              height={50}
              priority
            />
          </div>

          {/* Newsletter */}
          <div>
            <p className="width-2xl text-2xl leading-snug font-semibold uppercase">
              Sign up for new stories and personal offers
            </p>
            <form className="mt-6 flex overflow-hidden rounded-2xl border-2 border-gray-600">
              <input
                type="email"
                placeholder="E-mail"
                className="flex-1 bg-transparent px-6 py-4 text-base placeholder-gray-400 outline-none"
              />
            </form>
          </div>

          {/* Social Icons */}
          <div className="flex space-x-6 text-2xl">
            <a href="#" aria-label="Facebook" className="hover:text-gray-400">
              <Facebook size={28} />
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-gray-400">
              <Instagram size={28} />
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-gray-400">
              <Twitter size={28} />
            </a>
          </div>
        </div>

        {/* Link Groups */}
        <div>
          <h3 className="mb-6 text-lg font-semibold uppercase">
            Customer Care
          </h3>
          <ul className="space-y-3 text-base">
            <li>
              <a href="#" className="hover:text-gray-400">
                FAQs
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-400">
                Shipping Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-400">
                Refund Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-400">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-400">
                Terms & Service
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-6 text-lg font-semibold uppercase">Quick Links</h3>
          <ul className="space-y-3 text-base">
            <li>
              <a href="#" className="hover:text-gray-400">
                My Orders
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-400">
                Sell With Go Native
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-400">
                About Us
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-400">
                Store Locator
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-400">
                Contact Us
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-6 text-lg font-semibold uppercase">Quick Shop</h3>
          <ul className="space-y-3 text-base">
            <li>
              <a href="#" className="hover:text-gray-400">
                End of Season Sale
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-400">
                Shop by Brand
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-400">
                Best Sellers
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-400">
                New Arrivals
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Note */}
      <div className="mt-16 text-sm text-gray-500">
        © 2025 Rivan. Supported by <span className="italic">Ali Medhat</span>
      </div>
    </footer>
  );
}
