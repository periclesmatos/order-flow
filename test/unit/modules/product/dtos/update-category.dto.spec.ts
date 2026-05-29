import { UpdateCategorySchema } from '@src/modules/product/application/dtos/update-category.dto';
import { expectParseMessages } from '@test/unit/helpers/zod-schema.helpers';

describe('UpdateCategorySchema', () => {
  const valid = { name: 'Vestuário' };

  it('accepts valid payload and trims name', () => {
    const r = UpdateCategorySchema.safeParse({ name: '  Vestuário  ' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.name).toBe('Vestuário');
  });

  describe('name', () => {
    it('rejects when missing', () => {
      expectParseMessages(UpdateCategorySchema, {}, 'Nome é obrigatório');
    });

    it('rejects when not a string', () => {
      expectParseMessages(UpdateCategorySchema, { name: 99 }, 'Nome deve ser texto');
    });

    it('rejects empty string', () => {
      expectParseMessages(UpdateCategorySchema, { ...valid, name: '' }, 'Nome é obrigatório');
    });

    it('rejects more than 100 characters', () => {
      expectParseMessages(
        UpdateCategorySchema,
        { ...valid, name: 'x'.repeat(101) },
        'Nome deve ter no máximo 100 caracteres',
      );
    });
  });
});
