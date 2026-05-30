import { UpdateOrderStatusSchema } from '@src/modules/order/application/dtos/update-order-status.dto';

describe('UpdateOrderStatusSchema', () => {
  it.each(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])(
    'accepts %s',
    (status) => {
      const result = UpdateOrderStatusSchema.safeParse({ status });
      expect(result.success).toBe(true);
    },
  );

  it('rejects an unknown status', () => {
    const result = UpdateOrderStatusSchema.safeParse({ status: 'UNKNOWN' });
    expect(result.success).toBe(false);
  });

  it('rejects a missing status', () => {
    const result = UpdateOrderStatusSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
