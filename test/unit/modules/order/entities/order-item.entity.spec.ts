import { OrderItem } from '@src/modules/order/domain/entities/order-item.entity';
import { OrderItemInvalidQuantityError } from '@src/modules/order/domain/errors/order.errors';
import { Money } from '@src/modules/product/domain/entities/money.value-object';
import { createTestOrderItem, orderItemProps } from '../order-test.helpers';

describe('OrderItem entity', () => {
  it('creates with id and snapshot fields', () => {
    const item = createTestOrderItem({
      productName: 'Notebook',
      price: Money.fromFloat(10),
      quantity: 2,
    });
    expect(item.id).toEqual(expect.any(String));
    expect(item.productName).toBe('Notebook');
    expect(item.price.toFloat()).toBe(10);
    expect(item.quantity).toBe(2);
  });

  it('computes subtotal as price * quantity', () => {
    const item = createTestOrderItem({
      price: Money.fromFloat(2.5),
      quantity: 4,
    });
    expect(item.subtotal.toFloat()).toBe(10);
  });

  it('throws when quantity is not a positive integer', () => {
    expect(() => createTestOrderItem({ quantity: 0 })).toThrow(
      OrderItemInvalidQuantityError,
    );
    expect(() => createTestOrderItem({ quantity: -1 })).toThrow(
      OrderItemInvalidQuantityError,
    );
    expect(() => createTestOrderItem({ quantity: 1.5 })).toThrow(
      OrderItemInvalidQuantityError,
    );
  });

  it('restore converts cents back to Money', () => {
    const item = createTestOrderItem(orderItemProps());
    const restored = OrderItem.restore(item.toJSON());
    expect(restored.toJSON()).toEqual(item.toJSON());
    expect(restored.price.cents).toBe(item.price.cents);
  });
});
