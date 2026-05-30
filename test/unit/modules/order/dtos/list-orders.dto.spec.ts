import { ListOrdersSchema } from '@src/modules/order/application/dtos/list-orders.dto';

describe('ListOrdersSchema', () => {
  it('applies defaults when query is empty', () => {
    const result = ListOrdersSchema.parse({});
    expect(result).toMatchObject({
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      order: 'desc',
    });
  });

  it('coerces numeric query params', () => {
    const result = ListOrdersSchema.parse({ page: '2', limit: '5' });
    expect(result.page).toBe(2);
    expect(result.limit).toBe(5);
  });

  it('accepts valid filters', () => {
    const result = ListOrdersSchema.parse({
      status: 'SHIPPED',
      sortBy: 'orderNumber',
      order: 'asc',
    });
    expect(result.status).toBe('SHIPPED');
    expect(result.sortBy).toBe('orderNumber');
  });

  it('rejects an invalid status filter', () => {
    const result = ListOrdersSchema.safeParse({ status: 'NOPE' });
    expect(result.success).toBe(false);
  });
});
