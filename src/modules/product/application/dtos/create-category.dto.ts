import { z } from 'zod';

export const CreateCategorySchema = z.object({
  name: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? 'Nome é obrigatório'
          : 'Nome deve ser texto',
    })
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
});

export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>;
