import { CreateAddressSchema } from '@src/modules/customer/application/dtos/create-address.dto';
import { expectParseMessages } from '@test/unit/helpers/zod-schema.helpers';

describe('CreateAddressSchema', () => {
  const valid = {
    street: 'Rua A',
    number: '100',
    complement: '',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    postalCode: '01000-000',
    country: 'BR',
  };

  it('accepts valid payload', () => {
    const r = CreateAddressSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.street).toBe('Rua A');
      expect(r.data.isDefault).toBe(false);
    }
  });

  it('defaults complement to empty string when omitted', () => {
    const { complement: _, ...withoutComplement } = valid;
    const r = CreateAddressSchema.safeParse(withoutComplement);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.complement).toBe('');
    }
  });

  it('accepts isDefault true', () => {
    const r = CreateAddressSchema.safeParse({ ...valid, isDefault: true });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.isDefault).toBe(true);
    }
  });

  it('trims string fields', () => {
    const r = CreateAddressSchema.safeParse({
      ...valid,
      street: '  Rua B  ',
      number: '  10  ',
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.street).toBe('Rua B');
      expect(r.data.number).toBe('10');
    }
  });

  describe('street', () => {
    it('rejects when missing', () => {
      const { street: _, ...payload } = valid;
      expectParseMessages(CreateAddressSchema, payload, 'Rua é obrigatória');
    });

    it('rejects when not a string', () => {
      expectParseMessages(
        CreateAddressSchema,
        { ...valid, street: 1 },
        'Rua deve ser texto',
      );
    });

    it('rejects empty street', () => {
      expectParseMessages(
        CreateAddressSchema,
        { ...valid, street: '' },
        'Rua é obrigatória',
      );
    });

    it('rejects street longer than 100 characters', () => {
      expectParseMessages(
        CreateAddressSchema,
        { ...valid, street: 'x'.repeat(101) },
        'Rua deve ter no máximo 100 caracteres',
      );
    });
  });

  describe('number', () => {
    it('rejects when missing', () => {
      const { number: _, ...payload } = valid;
      expectParseMessages(CreateAddressSchema, payload, 'Número é obrigatório');
    });

    it('rejects when not a string', () => {
      expectParseMessages(
        CreateAddressSchema,
        { ...valid, number: 100 },
        'Número deve ser texto',
      );
    });
  });

  describe('complement', () => {
    it('rejects when not a string', () => {
      expectParseMessages(
        CreateAddressSchema,
        { ...valid, complement: 1 },
        'Complemento deve ser texto',
      );
    });
  });

  describe('neighborhood', () => {
    it('rejects when missing', () => {
      const { neighborhood: _, ...payload } = valid;
      expectParseMessages(CreateAddressSchema, payload, 'Bairro é obrigatório');
    });

    it('rejects when not a string', () => {
      expectParseMessages(
        CreateAddressSchema,
        { ...valid, neighborhood: false },
        'Bairro deve ser texto',
      );
    });
  });

  describe('city', () => {
    it('rejects when missing', () => {
      const { city: _, ...payload } = valid;
      expectParseMessages(CreateAddressSchema, payload, 'Cidade é obrigatória');
    });

    it('rejects when not a string', () => {
      expectParseMessages(
        CreateAddressSchema,
        { ...valid, city: 1 },
        'Cidade deve ser texto',
      );
    });
  });

  describe('state', () => {
    it('rejects when missing', () => {
      const { state: _, ...payload } = valid;
      expectParseMessages(CreateAddressSchema, payload, 'UF é obrigatório');
    });
  });

  describe('postalCode', () => {
    it('rejects when missing', () => {
      const { postalCode: _, ...payload } = valid;
      expectParseMessages(CreateAddressSchema, payload, 'CEP é obrigatório');
    });
  });

  describe('country', () => {
    it('rejects when missing', () => {
      const { country: _, ...payload } = valid;
      expectParseMessages(CreateAddressSchema, payload, 'País é obrigatório');
    });

    it('rejects when not a string', () => {
      expectParseMessages(
        CreateAddressSchema,
        { ...valid, country: 1 },
        'País deve ser texto',
      );
    });
  });
});
