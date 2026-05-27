import { z } from 'zod';

export const SORTABLE_FIELDS = [
  'name',
  'price',
  'createdAt',
  'stockOnHand',
] as const;

export const ListProductsSchema = z.object({
  name: z.string().optional(),
  isActive: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(SORTABLE_FIELDS).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type ListProductsDto = z.infer<typeof ListProductsSchema>;
