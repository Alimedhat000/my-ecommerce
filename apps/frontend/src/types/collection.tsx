// types/collection.ts
export interface Product {
  id: string;
  title: string;
  handle: string;
  images: ProductImage[];
  variants: ProductVariant[];
  collections: ProductCollection[];
  badges?: ProductBadge[];
  compareAtPrice?: number;
  price: number;
  currency: string;
}

export interface ProductImage {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface ProductVariant {
  id: string;
  title: string;
  color?: string;
  colorName?: string;
  colorHex?: string;
  available: boolean;
  price: number;
  compareAtPrice?: number;
}

export interface ProductCollection {
  handle: string;
  title: string;
}

export interface ProductBadge {
  text: string;
  type: 'sale' | 'category' | 'feature' | 'custom';
  color?: string;
  backgroundColor?: string;
}

export interface ActiveFilter {
  key: string;
  label: string;
  value: string;
  displayText: string;
}

export interface SortOption {
  value: string;
  label: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
