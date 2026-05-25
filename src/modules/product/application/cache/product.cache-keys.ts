export const productCacheKey = (id: string): string => `product:${id}`;

/** TTL padrão para cache de produto. Pode ser sobrescrito via PRODUCT_CACHE_TTL_MS no .env */
export const PRODUCT_CACHE_TTL_MS = Number(
  process.env.PRODUCT_CACHE_TTL_MS ?? 5 * 60 * 1000,
);
