'use client';

import { Drawer } from '../../ui/drawer/drawer';
import { DrawerContent } from '../../ui/drawer/drawerContent';
import { DrawerProvider } from '../../ui/drawer/drawerProvider';
import { DrawerTrigger } from '../../ui/drawer/drawerTrigger';
import { DrawerBody } from '../../ui/drawer/drawerBody';
import { DrawerHeader } from '../../ui/drawer/drawerHeader';
import { DrawerFooter } from '../../ui/drawer/drawerFooter';
import { CircleCheck } from 'lucide-react';
import { CartProductItem } from './cartProductItem';

export const QuickAddDrawer = ({
  children,
  item,
}: {
  item: {
    variantId: string;
    image: string;
    title: string;
    price: number;
    variantTitle: string;
    quantity: number;
  };
  children: React.ReactNode;
}) => {
  return (
    <DrawerProvider side="bottom">
      <DrawerTrigger asChild>{children}</DrawerTrigger>

      <Drawer width="528px" height="400px" className="dark">
        <DrawerContent>
          <DrawerHeader>
            <div className="text-success bg-success-bg flex items-center justify-center gap-4 rounded-lg p-4">
              <CircleCheck /> {'Added To Cart'}
            </div>
          </DrawerHeader>
          <DrawerBody>
            <CartProductItem
              key={item.variantId}
              item={item}
              className="pb-0"
            />
          </DrawerBody>
          <DrawerFooter>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <button className="bg-brand-orange hover:bg-brand-orange/80 flex-1 rounded-4xl py-4 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50">
                View cart
              </button>
              <button className="bg-background hover:bg-background/80 flex-1 rounded-3xl py-4 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50">
                Checkout
              </button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </DrawerProvider>
  );
};
