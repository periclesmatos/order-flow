import { z } from 'zod';

export const UpdateProductAmountSchema = z.object({
  amount: z
    .number({ error: (issue) => (issue.input === undefined ? 'Amount is required' : 'Amount must be a valid number') })
    .int('Amount must be an integer')
    .min(0, 'Amount cannot be negative'),
});

export type UpdateProductAmountDto = z.infer<typeof UpdateProductAmountSchema>;
