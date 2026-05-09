import { z } from 'zod';

const UpdateProductObjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).trim().optional(),
  isActive: z.boolean().optional(),
});

export const UpdateProductSchema = UpdateProductObjectSchema.refine((d) => d.name !== undefined || d.isActive !== undefined, { message: 'At least one field must be provided.' });

export type UpdateProductDto = z.infer<typeof UpdateProductObjectSchema>;
