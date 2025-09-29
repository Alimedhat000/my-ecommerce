import { api } from './client';

export async function getProductsByCollectionHandle(
  handle: string,
  page = 1,
  limit = 20,
  sort: string = 'manual'
) {
  const res = await api.get(`/collections/handle/${handle}/products`, {
    params: { page, limit, sort },
  });
  return res.data;
}
