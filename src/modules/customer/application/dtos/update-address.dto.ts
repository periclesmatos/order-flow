import { z } from 'zod';

const UpdateAddressObjectSchema = z.object({
  street: z
    .string({ error: () => 'Rua deve ser texto' })
    .min(1, 'Rua é obrigatória')
    .max(100, 'Rua deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  number: z
    .string({ error: () => 'Número deve ser texto' })
    .min(1, 'Número é obrigatório')
    .max(100, 'Número deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  complement: z
    .string({ error: () => 'Complemento deve ser texto' })
    .trim()
    .optional(),
  neighborhood: z
    .string({ error: () => 'Bairro deve ser texto' })
    .min(1, 'Bairro é obrigatório')
    .max(100, 'Bairro deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  city: z
    .string({ error: () => 'Cidade deve ser texto' })
    .min(1, 'Cidade é obrigatória')
    .max(100, 'Cidade deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  state: z
    .string({ error: () => 'UF deve ser texto' })
    .min(1, 'UF é obrigatório')
    .max(100, 'UF deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  postalCode: z
    .string({ error: () => 'CEP deve ser texto' })
    .min(1, 'CEP é obrigatório')
    .max(100, 'CEP deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  country: z
    .string({ error: () => 'País deve ser texto' })
    .min(1, 'País é obrigatório')
    .max(100, 'País deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  isDefault: z
    .boolean({ error: () => 'isDefault deve ser verdadeiro ou falso' })
    .optional(),
});

export const UpdateAddressSchema = UpdateAddressObjectSchema.refine(
  (data) => Object.values(data).some((value) => value !== undefined),
  { message: 'Informe pelo menos um campo para atualizar.' },
);

export type UpdateAddressDto = z.infer<typeof UpdateAddressObjectSchema>;
