import { z } from 'zod';

export const CreateProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).trim(),
  price: z.number().positive('Price must be a positive number'),
  amount: z.number().int().min(0, 'Amount cannot be negative'),
});

export type CreateProductDto = z.infer<typeof CreateProductSchema>;
