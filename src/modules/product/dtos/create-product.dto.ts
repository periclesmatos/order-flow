import { z } from 'zod';

export const CreateProductSchema = z.object({
  name: z
    .string({ error: (issue) => (issue.input === undefined ? 'Name is required' : 'Name must be text') })
    .min(1, 'Name cannot be empty')
    .max(100, 'Name must be at most 100 characters')
    .trim(),
  price: z
    .number({ error: (issue) => (issue.input === undefined ? 'Price is required' : 'Price must be a valid number') })
    .positive('Price must be a positive number'),
  amount: z
    .number({ error: (issue) => (issue.input === undefined ? 'Amount is required' : 'Amount must be a valid number') })
    .int('Amount must be an integer')
    .min(0, 'Amount cannot be negative'),
});

export type CreateProductDto = z.infer<typeof CreateProductSchema>;
