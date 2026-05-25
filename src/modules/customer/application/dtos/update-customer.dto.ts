import { z } from 'zod';

export const UpdateCustomerObjectSchema = z.object({
  name: z.string().max(100).optional(),
  email: z.email({
    message: 'E-mail inválido',
  }).optional(),
  phone: z.string().optional(),
});

export const UpdateCustomerSchema = UpdateCustomerObjectSchema.refine(
  (data) => Object.keys(data).length > 0,
  {
    message: 'At least one field must be provided for update',
  },
);

export type UpdateCustomerDto = z.infer<typeof UpdateCustomerObjectSchema>;
