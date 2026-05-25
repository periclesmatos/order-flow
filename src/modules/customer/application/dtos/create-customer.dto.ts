import { z } from 'zod';

import { CreateAddressSchema } from './create-address.dto.js';

export const CreateCustomerSchema = z
  .object({
    name: z
      .string({
        error: (issue) =>
          issue.input === undefined
            ? 'Nome é obrigatório'
            : 'Nome deve ser texto',
      })
      .min(3, 'Nome deve ter no mínimo 3 caracteres')
      .max(200, 'Nome deve ter no máximo 200 caracteres')
      .trim(),
    email: z
      .email({
        error: (issue) =>
          issue.input === undefined
            ? 'E-mail é obrigatório'
            : 'E-mail inválido',
      })
      .min(3, 'E-mail deve ter no mínimo 3 caracteres')
      .max(200, 'E-mail deve ter no máximo 200 caracteres')
      .trim(),
    phone: z
      .string({
        error: (issue) =>
          issue.input === undefined
            ? 'Telefone é obrigatório'
            : 'Telefone inválido',
      })
      .min(8, 'Telefone deve ter no mínimo 8 caracteres')
      .max(15, 'Telefone deve ter no máximo 15 caracteres')
      .trim(),
    addresses: z.array(CreateAddressSchema).optional(),
  })
  .superRefine((data, ctx) => {
    const addrs = data.addresses ?? [];
    if (addrs.length <= 1) return;
    const defaultCount = addrs.filter((a) => a.isDefault === true).length;
    if (defaultCount !== 1) {
      ctx.addIssue({
        code: 'custom',
        message:
          'Com múltiplos endereços, exatamente um deve ser o default (isDefault: true)',
        path: ['addresses'],
      });
    }
  });

export type CreateCustomerDto = z.infer<typeof CreateCustomerSchema>;
