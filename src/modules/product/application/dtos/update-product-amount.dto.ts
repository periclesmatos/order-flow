import { z } from 'zod';

export const UpdateProductAmountSchema = z.object({
  stockOnHand: z
    .number({
      error: (issue) =>
        issue.input === undefined
          ? 'Quantidade é obrigatória'
          : 'Quantidade deve ser um número válido',
    })
    .int('Quantidade deve ser um número inteiro')
    .min(0, 'Quantidade não pode ser negativa'),
});

export type UpdateProductAmountDto = z.infer<typeof UpdateProductAmountSchema>;
