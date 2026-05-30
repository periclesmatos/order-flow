import { z } from 'zod';
import { ORDER_STATUS_VALUES } from './update-order-status.dto';

export const ORDER_SORTABLE_FIELDS = [
  'orderNumber',
  'status',
  'createdAt',
  'updatedAt',
] as const;

export const ListOrdersSchema = z.object({
  status: z.enum(ORDER_STATUS_VALUES).optional(),
  customerId: z.uuid('ID de cliente inválido').optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(ORDER_SORTABLE_FIELDS).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type ListOrdersDto = z.infer<typeof ListOrdersSchema>;
