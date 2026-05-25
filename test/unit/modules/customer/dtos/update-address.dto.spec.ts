import { UpdateAddressSchema } from '@src/modules/customer/application/dtos/update-address.dto';
import { expectParseMessages } from '@test/unit/helpers/zod-schema.helpers';

describe('UpdateAddressSchema', () => {
  it('accepts partial payload with one field', () => {
    const r = UpdateAddressSchema.safeParse({ street: 'Rua Nova' });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.street).toBe('Rua Nova');
    }
  });

  it('rejects empty payload', () => {
    expectParseMessages(
      UpdateAddressSchema,
      {},
      'Informe pelo menos um campo para atualizar.',
    );
  });

  it('rejects empty street when provided', () => {
    expectParseMessages(UpdateAddressSchema, { street: '' }, 'Rua é obrigatória');
  });

  it('rejects street longer than 100 characters', () => {
    expectParseMessages(
      UpdateAddressSchema,
      { street: 'x'.repeat(101) },
      'Rua deve ter no máximo 100 caracteres',
    );
  });

  it('rejects street when not a string', () => {
    expectParseMessages(UpdateAddressSchema, { street: 123 }, 'Rua deve ser texto');
  });

  it('accepts isDefault only', () => {
    const r = UpdateAddressSchema.safeParse({ isDefault: true });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.isDefault).toBe(true);
    }
  });

  it('rejects isDefault when not a boolean', () => {
    expectParseMessages(
      UpdateAddressSchema,
      { isDefault: 'yes' },
      'isDefault deve ser verdadeiro ou falso',
    );
  });

  it('trims provided fields', () => {
    const r = UpdateAddressSchema.safeParse({ city: '  Campinas  ' });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.city).toBe('Campinas');
    }
  });

  describe('optional fields type errors', () => {
    it.each([
      ['number', 1, 'Número deve ser texto'],
      ['complement', 1, 'Complemento deve ser texto'],
      ['neighborhood', 1, 'Bairro deve ser texto'],
      ['city', 1, 'Cidade deve ser texto'],
      ['state', 1, 'UF deve ser texto'],
      ['postalCode', 1, 'CEP deve ser texto'],
      ['country', 1, 'País deve ser texto'],
    ] as const)('rejects invalid %s', (field, value, message) => {
      expectParseMessages(UpdateAddressSchema, { [field]: value }, message);
    });
  });
});
