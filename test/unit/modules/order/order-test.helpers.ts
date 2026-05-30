import { Order } from '@src/modules/order/domain/entities/order.entity';
import { OrderItem } from '@src/modules/order/domain/entities/order-item.entity';
import { OrderNumber } from '@src/modules/order/domain/entities/order-number.value-object';
import { OrderDeliveryAddress } from '@src/modules/order/domain/entities/order-delivery-address.value-object';
import { Money } from '@src/modules/product/domain/entities/money.value-object';
import type { CreateOrderItemProps } from '@src/modules/order/domain/entities/order-item.entity';
import type { CreateOrderProps } from '@src/modules/order/domain/entities/order.entity';
import type { OrderDeliveryAddressProps } from '@src/modules/order/domain/entities/order-delivery-address.value-object';

export function deliveryAddressProps(
  overrides: Partial<OrderDeliveryAddressProps> = {},
): OrderDeliveryAddressProps {
  return {
    street: 'Rua das Flores',
    number: '100',
    complement: '',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    postalCode: '01000-000',
    country: 'BR',
    ...overrides,
  };
}

export function orderItemProps(
  overrides: Partial<CreateOrderItemProps> = {},
): CreateOrderItemProps {
  return {
    productId: crypto.randomUUID(),
    productName: 'Produto teste',
    price: Money.fromFloat(10),
    quantity: 1,
    ...overrides,
  };
}

export function createTestOrderItem(
  overrides: Partial<CreateOrderItemProps> = {},
): OrderItem {
  return OrderItem.create(orderItemProps(overrides));
}

export function orderCreateProps(
  overrides: Partial<CreateOrderProps> = {},
): CreateOrderProps {
  return {
    orderNumber: OrderNumber.generate(1),
    customerId: crypto.randomUUID(),
    items: [createTestOrderItem()],
    deliveryAddress: OrderDeliveryAddress.createFromAddress(
      deliveryAddressProps(),
    ),
    ...overrides,
  };
}

export function createTestOrder(
  overrides: Partial<CreateOrderProps> = {},
): Order {
  return Order.create(orderCreateProps(overrides));
}
