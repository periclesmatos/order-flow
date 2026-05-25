import { CreateProductSchema } from '@src/modules/product/application/dtos/create-product.dto';
import { expectParseMessages } from '@test/unit/helpers/zod-schema.helpers';

describe('CreateProductSchema', () => {
  const valid = { name: 'Book', price: 9.99, stockOnHand: 2 };

  it('accepts valid payload and trims name', () => {
    const r = CreateProductSchema.safeParse({ name: '  Book  ', price: 9.99, stockOnHand: 2 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).toEqual({ name: 'Book', price: 9.99, stockOnHand: 2 });
    }
  });

  describe('name', () => {
    it('rejects when missing', () => {
      expectParseMessages(CreateProductSchema, { price: 1, stockOnHand: 0 }, 'Nome é obrigatório');
    });

    it('rejects when not a string', () => {
      expectParseMessages(
        CreateProductSchema,
        { name: 123, price: 1, stockOnHand: 0 },
        'Nome deve ser texto',
      );
    });

    it('rejects empty string', () => {
      expectParseMessages(CreateProductSchema, { ...valid, name: '' }, 'Nome é obrigatório');
    });

    it('rejects more than 100 characters', () => {
      expectParseMessages(
        CreateProductSchema,
        { ...valid, name: 'x'.repeat(101) },
        'Nome deve ter no máximo 100 caracteres',
      );
    });
  });

  describe('price', () => {
    it('rejects when missing', () => {
      expectParseMessages(CreateProductSchema, { name: 'X', stockOnHand: 0 }, 'Preço é obrigatório');
    });

    it('rejects when not a number', () => {
      expectParseMessages(
        CreateProductSchema,
        { name: 'X', price: '9.99', stockOnHand: 0 },
        'Preço deve ser um número válido',
      );
    });

    it('rejects zero', () => {
      expectParseMessages(
        CreateProductSchema,
        { ...valid, price: 0 },
        'Preço deve ser um número positivo',
      );
    });

    it('rejects negative price', () => {
      expectParseMessages(
        CreateProductSchema,
        { ...valid, price: -1 },
        'Preço deve ser um número positivo',
      );
    });
  });

  describe('stockOnHand', () => {
    it('rejects when missing', () => {
      expectParseMessages(CreateProductSchema, { name: 'X', price: 1 }, 'Quantidade é obrigatória');
    });

    it('rejects when not a number', () => {
      expectParseMessages(
        CreateProductSchema,
        { name: 'X', price: 1, stockOnHand: '2' },
        'Quantidade deve ser um número válido',
      );
    });

    it('rejects non-integer', () => {
      expectParseMessages(
        CreateProductSchema,
        { ...valid, stockOnHand: 1.5 },
        'Quantidade deve ser um número inteiro',
      );
    });

    it('rejects negative amount', () => {
      expectParseMessages(
        CreateProductSchema,
        { ...valid, stockOnHand: -1 },
        'Quantidade não pode ser negativa',
      );
    });

    it('accepts zero', () => {
      const r = CreateProductSchema.safeParse({ ...valid, stockOnHand: 0 });
      expect(r.success).toBe(true);
    });
  });
});
