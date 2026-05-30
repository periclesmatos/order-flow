import { z } from 'zod';

export const CreateProductSchema = z.object({
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
  description: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? 'Descrição é obrigatória'
          : 'Descrição deve ser texto',
    })
    .min(1, 'Descrição é obrigatória')
    .max(255, 'Descrição deve ter no máximo 255 caracteres')
    .trim(),
  price: z
    .number({
      error: (issue) =>
        issue.input === undefined
          ? 'Preço é obrigatório'
          : 'Preço deve ser um número válido',
    })
    .positive('Preço deve ser um número positivo'),
  stockOnHand: z
    .number({
      error: (issue) =>
        issue.input === undefined
          ? 'Quantidade é obrigatória'
          : 'Quantidade deve ser um número válido',
    })
    .int('Quantidade deve ser um número inteiro')
    .min(0, 'Quantidade não pode ser negativa'),
  categoryId: z.uuid('ID de categoria inválido').optional(),
});

export type CreateProductDto = z.infer<typeof CreateProductSchema>;
