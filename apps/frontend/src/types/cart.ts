export interface CartItem {
  variantId: string;
  productId: string;
  productHandle: string;
  title: string;
  variantTitle: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  quantity: number;
  available: boolean;
  vendor?: string;
}

export interface Cart {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
}
