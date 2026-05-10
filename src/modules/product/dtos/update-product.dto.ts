import { z } from 'zod';

const UpdateProductObjectSchema = z.object({
  name: z
    .string({ error: () => 'Name must be text' })
    .min(1, 'Name cannot be empty')
    .max(100, 'Name must be at most 100 characters')
    .trim()
    .optional(),
  isActive: z
    .boolean({ error: () => 'isActive must be true or false' })
    .optional(),
});

export const UpdateProductSchema = UpdateProductObjectSchema.refine((d) => d.name !== undefined || d.isActive !== undefined, { message: 'At least one field must be provided.' });

export type UpdateProductDto = z.infer<typeof UpdateProductObjectSchema>;
