import { z } from 'zod';

export const ORDER_STATUS_VALUES = [
  'PENDING',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
] as const;

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUS_VALUES, {
    error: () =>
      'Status inválido. Use: PENDING, PROCESSING, SHIPPED, DELIVERED ou CANCELLED.',
  }),
});

export type UpdateOrderStatusDto = z.infer<typeof UpdateOrderStatusSchema>;
