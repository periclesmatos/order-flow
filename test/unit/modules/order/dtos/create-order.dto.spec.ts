import { CreateOrderSchema } from '@src/modules/order/application/dtos/create-order.dto';
import { expectParseMessages } from '../../../helpers/zod-schema.helpers';

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

const validBody = (overrides: Record<string, unknown> = {}) => ({
  customerId: VALID_UUID,
  addressId: VALID_UUID,
  items: [{ productId: VALID_UUID, quantity: 2 }],
  ...overrides,
});

describe('CreateOrderSchema', () => {
  it('parses a valid body', () => {
    const result = CreateOrderSchema.safeParse(validBody());
    expect(result.success).toBe(true);
  });

  it('requires at least one item', () => {
    expectParseMessages(
      CreateOrderSchema,
      validBody({ items: [] }),
      'O pedido deve conter pelo menos um item',
    );
  });

  it('rejects invalid customer and address ids', () => {
    expectParseMessages(
      CreateOrderSchema,
      validBody({ customerId: 'nope', addressId: 'nope' }),
      'ID de cliente inválido',
      'ID de endereço inválido',
    );
  });

  it('rejects invalid item product id', () => {
    expectParseMessages(
      CreateOrderSchema,
      validBody({ items: [{ productId: 'nope', quantity: 1 }] }),
      'ID de produto inválido',
    );
  });

  it('rejects non-positive or non-integer quantities', () => {
    expectParseMessages(
      CreateOrderSchema,
      validBody({ items: [{ productId: VALID_UUID, quantity: 0 }] }),
      'Quantidade deve ser maior que zero',
    );
    expectParseMessages(
      CreateOrderSchema,
      validBody({ items: [{ productId: VALID_UUID, quantity: 1.5 }] }),
      'Quantidade deve ser um número inteiro',
    );
  });
});
