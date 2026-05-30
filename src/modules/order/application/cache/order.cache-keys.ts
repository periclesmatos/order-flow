export const orderCacheKey = (id: string): string => `order:${id}`;

/** TTL padrão para cache de pedido. Pode ser sobrescrito via ORDER_CACHE_TTL_MS no .env */
export const ORDER_CACHE_TTL_MS = Number(
  process.env.ORDER_CACHE_TTL_MS ?? 5 * 60 * 1000,
);

export const ORDER_LIST_CACHE_PATTERN = 'orders:list:*';

export const orderListCacheKey = (dto: {
  page: number;
  limit: number;
  sortBy: string;
  order: string;
  status?: string;
  customerId?: string;
}): string =>
  `orders:list:${dto.page}:${dto.limit}:${dto.sortBy}:${dto.order}:${dto.status ?? ''}:${dto.customerId ?? ''}`;

export const ORDER_LIST_CACHE_TTL_MS = Number(
  process.env.ORDER_LIST_CACHE_TTL_MS ?? 2 * 60 * 1000,
);
