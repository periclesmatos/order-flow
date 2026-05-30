import { UpdateProductSchema } from '@src/modules/product/application/dtos/update-product.dto';
import { expectParseMessages } from '@test/unit/helpers/zod-schema.helpers';

describe('UpdateProductSchema', () => {
  it('accepts description-only update', () => {
    const r = UpdateProductSchema.safeParse({ description: 'Nova descrição' });
    expect(r.success).toBe(true);
  });

  it('rejects empty body', () => {
    expectParseMessages(
      UpdateProductSchema,
      {},
      'Informe pelo menos um campo para atualizar.',
    );
  });

  it('rejects empty description', () => {
    expectParseMessages(
      UpdateProductSchema,
      { description: '' },
      'Descrição é obrigatória',
    );
  });

  it('accepts categoryId-only update', () => {
    const r = UpdateProductSchema.safeParse({
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(r.success).toBe(true);
  });

  it('rejects an invalid categoryId', () => {
    expectParseMessages(
      UpdateProductSchema,
      { categoryId: 'not-a-uuid' },
      'ID de categoria inválido',
    );
  });
});
