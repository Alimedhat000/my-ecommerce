// types/collection.ts
export interface Product {
  id: number; // matches API "id"
  shopifyId: string;
  title: string;
  handle: string;
  bodyHtml: string;
  vendor: string; // API uses vendor instead of collections
  tags: string[];
  status: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  images: ProductImage[];
  variants: ProductVariant[];
  badges?: ProductBadge[]; // optional
  compareAtPrice?: number;
  price: number;
}

export interface ProductImage {
  id: number;
  shopifyId: string;
  src: string;
  alt?: string | null;
  width: number;
  height: number;
  position: number;
  variantIds: string[];
  productId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: number;
  shopifyId: string;
  title: string;
  sku: string;
  barcode?: string | null;
  price: number;
  compareAtPrice?: number;
  inventoryQty: number;
  position: number;
  weight: number;
  requiresShipping: boolean;
  taxable: boolean;
  available: boolean;
  createdAt: string;
  updatedAt: string;
  option1?: string | null;
  option2?: string | null;
  option3?: string | null;
  productId: number;
  imageId?: number | null;
}

export interface ProductCollection {
  handle: string;
  title: string;
}

export interface ProductBadge {
  text: string;
  type: 'sale' | 'category' | 'feature' | 'custom' | 'soldout';
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
