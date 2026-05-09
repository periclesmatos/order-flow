import { z } from 'zod';

export const UpdateProductPriceSchema = z.object({
  price: z.number().positive('Price must be positive'),
});

export type UpdateProductPriceDto = z.infer<typeof UpdateProductPriceSchema>;
