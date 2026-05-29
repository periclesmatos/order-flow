import { z } from 'zod';

export const ListCategoriesSchema = z.object({
  name: z.string().optional(),
  isActive: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListCategoriesDto = z.infer<typeof ListCategoriesSchema>;
