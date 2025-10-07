'use client';

import { Cart, CartItem } from '@/types/cart';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

const CART_KEY = 'shopping_cart';

export const cartStorage = {
  // Get cart from localStorage
  getCart: (): Cart => {
    if (typeof window === 'undefined') {
      return { items: [], itemCount: 0, subtotal: 0 };
    }

    try {
      const stored = localStorage.getItem(CART_KEY);
      if (!stored) {
        return { items: [], itemCount: 0, subtotal: 0 };
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error reading cart:', error);
      return { items: [], itemCount: 0, subtotal: 0 };
    }
  },

  // Save cart to localStorage
  saveCart: (cart: Cart): void => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      // Dispatch custom event for cross-tab synchronization
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  },

  // Clear cart
  clearCart: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(CART_KEY);
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: null }));
  },
};

interface CartContextType {
  cart: Cart;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  isLoading: boolean;

  isCartDrawerOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({
    items: [],
    subtotal: 0,
    itemCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  const calculateTotals = useCallback((items: CartItem[]): Cart => {
    const itemCount = items.reduce((sum, items) => sum + items.quantity, 0);

    const subtotal = items.reduce(
      (sum, items) => sum + items.quantity * items.price,
      0
    );
    return { items, itemCount, subtotal };
  }, []);

  useEffect(() => {
    const storedCart = cartStorage.getCart();
    setCart(storedCart);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'shopping_cart' && e.newValue) {
        setCart(JSON.parse(e.newValue));
      }
    };

    const handleCartUpdate = (e: CustomEvent) => {
      if (e.detail) {
        setCart(e.detail);
      } else {
        setCart({ items: [], itemCount: 0, subtotal: 0 });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleCartUpdate as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(
        'cartUpdated',
        handleCartUpdate as EventListener
      );
    };
  }, []);

  const addItem = useCallback(
    (newItem: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
      setCart((prev) => {
        const existingItem = prev.items.find(
          (item) => item.variantId === newItem.variantId
        );

        let updatedItems: CartItem[];
        if (existingItem) {
          updatedItems = prev.items.map((item) =>
            item.variantId === newItem.variantId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          updatedItems = [...prev.items, { ...newItem, quantity }];
        }

        const newCart = calculateTotals(updatedItems);
        cartStorage.saveCart(newCart);
        return newCart;
      });

      // setIsCartDrawerOpen(true);
    },
    [calculateTotals]
  );

  const removeItem = useCallback(
    (variantId: string) => {
      setCart((prev) => {
        const updatedItems = prev.items.filter(
          (item) => item.variantId !== variantId
        );
        const newCart = calculateTotals(updatedItems);
        cartStorage.saveCart(newCart);
        return newCart;
      });
    },
    [calculateTotals]
  );

  const updateQuantity = useCallback(
    (variantId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(variantId);
        return;
      }

      setCart((prev) => {
        const updatedItems = prev.items.map((item) =>
          item.variantId === variantId ? { ...item, quantity } : item
        );
        const newCart = calculateTotals(updatedItems);
        cartStorage.saveCart(newCart);
        return newCart;
      });
    },
    [calculateTotals, removeItem]
  );

  const clearCart = useCallback(() => {
    setCart({ items: [], itemCount: 0, subtotal: 0 });
    cartStorage.clearCart();
  }, []);

  const openCartDrawer = useCallback(() => {
    setIsCartDrawerOpen(true);
  }, []);

  const closeCartDrawer = useCallback(() => {
    setIsCartDrawerOpen(false);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isLoading,
        isCartDrawerOpen,
        openCartDrawer,
        closeCartDrawer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
