export const productCacheKey = (id: string): string => `product:${id}`;

/** TTL padrão para cache de produto. Pode ser sobrescrito via PRODUCT_CACHE_TTL_MS no .env */
export const PRODUCT_CACHE_TTL_MS = Number(
  process.env.PRODUCT_CACHE_TTL_MS ?? 5 * 60 * 1000,
);

export const PRODUCT_LIST_CACHE_PATTERN = 'products:list:*';

export const productListCacheKey = (dto: {
  page: number;
  limit: number;
  sortBy: string;
  order: string;
  name?: string;
  isActive?: boolean;
}): string =>
  `products:list:${dto.page}:${dto.limit}:${dto.sortBy}:${dto.order}:${dto.name ?? ''}:${dto.isActive ?? ''}`;

export const PRODUCT_LIST_CACHE_TTL_MS = Number(
  process.env.PRODUCT_LIST_CACHE_TTL_MS ?? 2 * 60 * 1000,
);
