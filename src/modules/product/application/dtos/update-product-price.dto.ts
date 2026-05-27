import { z } from 'zod';

export const UpdateProductPriceSchema = z.object({
  price: z
    .number({
      error: (issue) =>
        issue.input === undefined
          ? 'Preço é obrigatório'
          : 'Preço deve ser um número válido',
    })
    .positive('Preço deve ser positivo'),
});

export type UpdateProductPriceDto = z.infer<typeof UpdateProductPriceSchema>;
