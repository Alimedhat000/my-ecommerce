'use client';

import { useCart } from '@/contexts/cartContext';
import { Drawer } from '../../ui/drawer/drawer';
import { DrawerBody } from '../../ui/drawer/drawerBody';
import { DrawerClose } from '../../ui/drawer/drawerClose';
import { DrawerContent } from '../../ui/drawer/drawerContent';
import { DrawerFooter } from '../../ui/drawer/drawerFooter';
import { DrawerHeader } from '../../ui/drawer/drawerHeader';
import { DrawerProvider } from '../../ui/drawer/drawerProvider';
import { DrawerTrigger } from '../../ui/drawer/drawerTrigger';
import { CartProductItem } from './cartProductItem';

export const CartDrawer = ({ children }: { children: React.ReactNode }) => {
  const { cart, removeItem, updateQuantity } = useCart();

  return (
    <DrawerProvider side="right">
      <DrawerTrigger asChild>{children}</DrawerTrigger>

      <Drawer width="680px" className="dark">
        <DrawerContent>
          <DrawerHeader className="flex items-center justify-between px-10 pt-8">
            <h5 className="font-heading flex items-center text-xl">
              Cart{' '}
              <p className="ml-2 h-5 w-5 rounded-full bg-black text-sm text-white">
                {cart.itemCount}
              </p>
            </h5>
            <DrawerClose className="text-2xl leading-none">×</DrawerClose>
          </DrawerHeader>

          <DrawerBody className="px-10 py-8">
            {cart.items.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <p className="text-lg text-gray-500">Your cart is empty</p>
                  <p className="mt-2 text-sm text-gray-400">
                    Add items to get started
                  </p>
                </div>
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
          </DrawerBody>

          <DrawerFooter className="border border-t-[#e0e0e0] p-10 pt-6">
            <div className="space-y-3">
              <div className="font-heading flex justify-between text-xl">
                <span>Total:</span>
                <span>{cart.subtotal.toFixed(2)} EGP</span>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <button className="bg-brand-orange hover:bg-brand-orange/80 flex-1 rounded-4xl py-4 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50">
                  View cart
                </button>
                <button className="bg-background hover:bg-background/80 flex-1 rounded-3xl py-4 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50">
                  Checkout
                </button>
              </div>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </DrawerProvider>
  );
};
