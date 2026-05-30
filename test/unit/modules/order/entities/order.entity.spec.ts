import { Order } from '@src/modules/order/domain/entities/order.entity';
import {
  EmptyOrderError,
  InvalidStatusTransitionError,
} from '@src/modules/order/domain/errors/order.errors';
import { Money } from '@src/modules/product/domain/entities/money.value-object';
import {
  createTestOrder,
  createTestOrderItem,
  orderCreateProps,
} from '../order-test.helpers';

describe('Order entity', () => {
  it('create assigns id, PENDING status and timestamps', () => {
    const order = createTestOrder();
    expect(order.id).toEqual(expect.any(String));
    expect(order.status).toBe('PENDING');
    expect(order.createdAt).toBeInstanceOf(Date);
    expect(order.updatedAt).toBeInstanceOf(Date);
  });

  it('create throws when there are no items', () => {
    expect(() => createTestOrder({ items: [] })).toThrow(EmptyOrderError);
  });

  it('total sums the subtotals of all items', () => {
    const order = createTestOrder({
      items: [
        createTestOrderItem({ price: Money.fromFloat(10), quantity: 2 }),
        createTestOrderItem({ price: Money.fromFloat(5), quantity: 3 }),
      ],
    });
    expect(order.total.toFloat()).toBe(35);
  });

  it('allows valid status transitions', () => {
    const order = createTestOrder();
    order.changeStatus('PROCESSING');
    expect(order.status).toBe('PROCESSING');
    order.changeStatus('SHIPPED');
    expect(order.status).toBe('SHIPPED');
    order.changeStatus('DELIVERED');
    expect(order.status).toBe('DELIVERED');
  });

  it('rejects invalid status transitions', () => {
    const order = createTestOrder();
    expect(() => order.changeStatus('SHIPPED')).toThrow(
      InvalidStatusTransitionError,
    );
    expect(() => order.changeStatus('DELIVERED')).toThrow(
      InvalidStatusTransitionError,
    );
  });

  it('cancels from PENDING and PROCESSING but not from terminal states', () => {
    const pending = createTestOrder();
    pending.cancel();
    expect(pending.status).toBe('CANCELLED');

    const delivered = createTestOrder();
    delivered.changeStatus('PROCESSING');
    delivered.changeStatus('SHIPPED');
    delivered.changeStatus('DELIVERED');
    expect(() => delivered.cancel()).toThrow(InvalidStatusTransitionError);
  });

  it('consumesStock only on PROCESSING -> SHIPPED', () => {
    expect(Order.consumesStock('PROCESSING', 'SHIPPED')).toBe(true);
    expect(Order.consumesStock('PENDING', 'PROCESSING')).toBe(false);
    expect(Order.consumesStock('SHIPPED', 'DELIVERED')).toBe(false);
  });

  it('releasesStock on any transition to CANCELLED', () => {
    expect(Order.releasesStock('PENDING', 'CANCELLED')).toBe(true);
    expect(Order.releasesStock('PROCESSING', 'CANCELLED')).toBe(true);
    expect(Order.releasesStock('PROCESSING', 'SHIPPED')).toBe(false);
  });

  it('restore rebuilds an equivalent order from primitives', () => {
    const order = createTestOrder(orderCreateProps());
    const restored = Order.restore(order.toJSON());
    expect(restored.toJSON()).toEqual(order.toJSON());
    expect(restored.total.cents).toBe(order.total.cents);
  });
});
