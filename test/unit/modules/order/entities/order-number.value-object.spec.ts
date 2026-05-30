import { OrderNumber } from '@src/modules/order/domain/entities/order-number.value-object';

describe('OrderNumber value object', () => {
  it('generates a zero-padded value from a sequence', () => {
    expect(OrderNumber.generate(1).value).toBe('ORD-000001');
    expect(OrderNumber.generate(123).value).toBe('ORD-000123');
  });

  it('does not truncate sequences above six digits', () => {
    expect(OrderNumber.generate(1234567).value).toBe('ORD-1234567');
  });

  it('restores from an existing value', () => {
    const restored = OrderNumber.restore('ORD-000042');
    expect(restored.value).toBe('ORD-000042');
    expect(restored.toString()).toBe('ORD-000042');
  });
});
