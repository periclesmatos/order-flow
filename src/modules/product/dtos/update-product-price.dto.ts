import { z } from 'zod';

export const UpdateProductPriceSchema = z.object({
  price: z
    .number({ error: (issue) => (issue.input === undefined ? 'Price is required' : 'Price must be a valid number') })
    .positive('Price must be positive'),
});

export type UpdateProductPriceDto = z.infer<typeof UpdateProductPriceSchema>;
