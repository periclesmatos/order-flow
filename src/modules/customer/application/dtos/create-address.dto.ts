import { z } from 'zod';

export const CreateAddressSchema = z.object({
  street: z
    .string({
      error: (issue) =>
        issue.input === undefined ? 'Rua é obrigatória' : 'Rua deve ser texto',
    })
    .min(1, 'Rua é obrigatória')
    .max(100, 'Rua deve ter no máximo 100 caracteres')
    .trim(),
  number: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? 'Número é obrigatório'
          : 'Número deve ser texto',
    })
    .min(1, 'Número é obrigatório')
    .max(100, 'Número deve ter no máximo 100 caracteres')
    .trim(),
  complement: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? 'Complemento é obrigatório'
          : 'Complemento deve ser texto',
    })
    .trim()
    .default(''),
  neighborhood: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? 'Bairro é obrigatório'
          : 'Bairro deve ser texto',
    })
    .min(1, 'Bairro é obrigatório')
    .max(100, 'Bairro deve ter no máximo 100 caracteres')
    .trim(),
  city: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? 'Cidade é obrigatória'
          : 'Cidade deve ser texto',
    })
    .min(1, 'Cidade é obrigatória')
    .max(100, 'Cidade deve ter no máximo 100 caracteres')
    .trim(),
  state: z
    .string({
      error: (issue) =>
        issue.input === undefined ? 'UF é obrigatório' : 'UF deve ser texto',
    })
    .min(1, 'UF é obrigatório')
    .max(100, 'UF deve ter no máximo 100 caracteres')
    .trim(),
  postalCode: z
    .string({
      error: (issue) =>
        issue.input === undefined ? 'CEP é obrigatório' : 'CEP deve ser texto',
    })
    .min(1, 'CEP é obrigatório')
    .max(100, 'CEP deve ter no máximo 100 caracteres')
    .trim(),
  country: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? 'País é obrigatório'
          : 'País deve ser texto',
    })
    .min(1, 'País é obrigatório')
    .max(100, 'País deve ter no máximo 100 caracteres')
    .trim(),
  isDefault: z.boolean().optional().default(false),
});

export type CreateAddressDto = z.infer<typeof CreateAddressSchema>;
