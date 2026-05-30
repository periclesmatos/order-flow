import { CreateProductSchema } from '@src/modules/product/application/dtos/create-product.dto';
import { expectParseMessages } from '@test/unit/helpers/zod-schema.helpers';

describe('CreateProductSchema', () => {
  const valid = {
    name: 'Book',
    description: 'Livro de ficção',
    price: 9.99,
    stockOnHand: 2,
  };

  it('accepts valid payload and trims name and description', () => {
    const r = CreateProductSchema.safeParse({
      name: '  Book  ',
      description: '  Livro de ficção  ',
      price: 9.99,
      stockOnHand: 2,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).toEqual({
        name: 'Book',
        description: 'Livro de ficção',
        price: 9.99,
        stockOnHand: 2,
      });
    }
  });

  describe('name', () => {
    it('rejects when missing', () => {
      expectParseMessages(
        CreateProductSchema,
        { description: 'X', price: 1, stockOnHand: 0 },
        'Nome é obrigatório',
      );
    });

    it('rejects when not a string', () => {
      expectParseMessages(
        CreateProductSchema,
        { name: 123, description: 'Desc', price: 1, stockOnHand: 0 },
        'Nome deve ser texto',
      );
    });

    it('rejects empty string', () => {
      expectParseMessages(
        CreateProductSchema,
        { ...valid, name: '' },
        'Nome é obrigatório',
      );
    });

    it('rejects more than 100 characters', () => {
      expectParseMessages(
        CreateProductSchema,
        { ...valid, name: 'x'.repeat(101) },
        'Nome deve ter no máximo 100 caracteres',
      );
    });
  });

  describe('description', () => {
    it('rejects when missing', () => {
      expectParseMessages(
        CreateProductSchema,
        { name: 'X', price: 1, stockOnHand: 0 },
        'Descrição é obrigatória',
      );
    });

    it('rejects empty string', () => {
      expectParseMessages(
        CreateProductSchema,
        { ...valid, description: '' },
        'Descrição é obrigatória',
      );
    });

    it('rejects more than 255 characters', () => {
      expectParseMessages(
        CreateProductSchema,
        { ...valid, description: 'x'.repeat(256) },
        'Descrição deve ter no máximo 255 caracteres',
      );
    });
  });

  describe('price', () => {
    it('rejects when missing', () => {
      expectParseMessages(
        CreateProductSchema,
        { name: 'X', description: 'Desc', stockOnHand: 0 },
        'Preço é obrigatório',
      );
    });

    it('rejects when not a number', () => {
      expectParseMessages(
        CreateProductSchema,
        { name: 'X', description: 'Desc', price: '9.99', stockOnHand: 0 },
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
      expectParseMessages(
        CreateProductSchema,
        { name: 'X', description: 'Desc', price: 1 },
        'Quantidade é obrigatória',
      );
    });

    it('rejects when not a number', () => {
      expectParseMessages(
        CreateProductSchema,
        { name: 'X', description: 'Desc', price: 1, stockOnHand: '2' },
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

  describe('categoryId', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';

    it('accepts a valid uuid', () => {
      const r = CreateProductSchema.safeParse({ ...valid, categoryId: uuid });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.categoryId).toBe(uuid);
    });

    it('accepts payload without categoryId', () => {
      const r = CreateProductSchema.safeParse(valid);
      expect(r.success).toBe(true);
    });

    it('rejects an invalid uuid', () => {
      expectParseMessages(
        CreateProductSchema,
        { ...valid, categoryId: 'not-a-uuid' },
        'ID de categoria inválido',
      );
    });
  });
});
