import { CreateCategorySchema } from '@src/modules/product/application/dtos/create-category.dto';
import { expectParseMessages } from '@test/unit/helpers/zod-schema.helpers';

describe('CreateCategorySchema', () => {
  const valid = { name: 'Eletrônicos' };

  it('accepts valid payload and trims name', () => {
    const r = CreateCategorySchema.safeParse({ name: '  Eletrônicos  ' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.name).toBe('Eletrônicos');
  });

  describe('name', () => {
    it('rejects when missing', () => {
      expectParseMessages(CreateCategorySchema, {}, 'Nome é obrigatório');
    });

    it('rejects when not a string', () => {
      expectParseMessages(CreateCategorySchema, { name: 123 }, 'Nome deve ser texto');
    });

    it('rejects empty string', () => {
      expectParseMessages(CreateCategorySchema, { ...valid, name: '' }, 'Nome é obrigatório');
    });

    it('rejects more than 100 characters', () => {
      expectParseMessages(
        CreateCategorySchema,
        { ...valid, name: 'x'.repeat(101) },
        'Nome deve ter no máximo 100 caracteres',
      );
    });
  });
});
