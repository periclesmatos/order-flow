import { z } from 'zod';

export const CreateOrderSchema = z.object({
  customerId: z.uuid('ID de cliente inválido'),
  addressId: z.uuid('ID de endereço inválido'),
  items: z
    .array(
      z.object({
        productId: z.uuid('ID de produto inválido'),
        quantity: z
          .number({
            error: (issue) =>
              issue.input === undefined
                ? 'Quantidade é obrigatória'
                : 'Quantidade deve ser um número válido',
          })
          .int('Quantidade deve ser um número inteiro')
          .positive('Quantidade deve ser maior que zero'),
      }),
      { error: () => 'Itens do pedido são obrigatórios' },
    )
    .min(1, 'O pedido deve conter pelo menos um item'),
});

export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;
