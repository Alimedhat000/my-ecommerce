import { api } from './client';

export async function getProductsByCollectionHandle(
  handle: string,
  page = 1,
  limit = 20,
  sort: string = 'manual',
  filters?: {
    vendor?: string;
    productType?: string;
    gender?: string;
    size?: string;
    color?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: boolean;
  }
) {
  // eslint-disable-next-line
  const params: Record<string, any> = { page, limit, sort };

  // Add filters to params if they exist
  if (filters) {
    if (filters.vendor) params.vendor = filters.vendor;
    if (filters.productType) params.productType = filters.productType;
    if (filters.gender) params.gender = filters.gender;
    if (filters.size) params.size = filters.size;
    if (filters.color) params.color = filters.color;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.inStock !== undefined) params.inStock = filters.inStock;
  }

  const res = await api.get(`/collections/handle/${handle}/products`, {
    params,
  });
  return res.data;
}
