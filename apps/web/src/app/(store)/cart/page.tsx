'use client';

import { useCart } from '@/contexts/cartContext';
import { CartProductItem } from '@/components/layout/drawers/cartProductItem';
import { Lock } from 'lucide-react';

function CartPage() {
  const { cart, removeItem, updateQuantity } = useCart();

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-center text-4xl font-bold">Cart</h1>
      </header>
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px]">
        <section>
          {cart.items.length === 0 ? (
            <div className="bg-card flex h-full flex-col items-center justify-center rounded-lg p-8">
              <p className="text-muted-foreground text-lg">
                Your cart is empty
              </p>
              <p className="text-muted-foreground mt-2 text-sm">
                Add items to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <CartProductItem
                  key={item.variantId}
                  item={item}
                  updateQuantity={updateQuantity}
                  removeItem={removeItem}
                />
              ))}
            </div>
          )}
        </section>

        {/* final checkout card */}
        <aside>
          <div className="border-border sticky top-24 rounded-lg border px-10 py-12">
            <div className="mb-6 space-y-1">
              <div className="text-muted-foreground flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{cart.subtotal.toFixed(2)} EGP</span>
              </div>
              <div className="font-heading flex justify-between text-xl font-semibold uppercase">
                <span>Total</span>
                <span>{cart.subtotal.toFixed(2)} EGP</span>
              </div>
            </div>
            <div className="mb-6">
              <textarea
                id="order-note"
                name="order-note"
                rows={3}
                className="bg-muted border-border w-full rounded-md border p-2 focus:border-black"
                placeholder="Add any special instructions for your order..."
              ></textarea>
            </div>
            <button className="bg-foreground hover:bg-foreground/80 flex w-full items-center justify-center gap-2 rounded-3xl py-4 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50">
              <Lock size={16} />
              Checkout
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default CartPage;
