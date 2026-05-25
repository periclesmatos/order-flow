import { z } from 'zod';

const UpdateProductObjectSchema = z.object({
  name: z
    .string({ error: () => 'Nome deve ser texto' })
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  isActive: z
    .boolean({ error: () => 'isActive deve ser verdadeiro ou falso' })
    .optional(),
});

export const UpdateProductSchema = UpdateProductObjectSchema.refine(
  (d) => d.name !== undefined || d.isActive !== undefined,
  { message: 'Informe pelo menos um campo para atualizar.' },
);

export type UpdateProductDto = z.infer<typeof UpdateProductObjectSchema>;
