import { z } from 'zod';

export const UpdateProductAmountSchema = z.object({
  amount: z.number().int().min(0, 'Amount cannot be negative'),
});

export type UpdateProductAmountDto = z.infer<typeof UpdateProductAmountSchema>;
