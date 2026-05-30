import { Money } from '../../../product/domain/entities/money.value-object';
import { EmptyOrderError, InvalidStatusTransitionError } from '../errors/order.errors';
import { OrderNumber } from './order-number.value-object';
import { OrderItem } from './order-item.entity';
import { OrderDeliveryAddress } from './order-delivery-address.value-object';
import type { OrderItemPrimitives } from './order-item.entity';
import type { OrderDeliveryAddressProps } from './order-delivery-address.value-object';

export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

export interface OrderProps {
  id: string;
  orderNumber: OrderNumber;
  customerId: string;
  status: OrderStatus;
  items: OrderItem[];
  deliveryAddress: OrderDeliveryAddress;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderPrimitives = {
  id: string;
  orderNumber: string;
  customerId: string;
  status: OrderStatus;
  items: OrderItemPrimitives[];
  deliveryAddress: OrderDeliveryAddressProps;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateOrderProps = {
  orderNumber: OrderNumber;
  customerId: string;
  items: OrderItem[];
  deliveryAddress: OrderDeliveryAddress;
};

export class Order {
  private readonly _props: OrderProps;

  private constructor(props: OrderProps) {
    this._props = props;
  }

  static create(props: CreateOrderProps): Order {
    if (props.items.length === 0) throw new EmptyOrderError();
    return new Order({
      ...props,
      id: crypto.randomUUID(),
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(props: OrderPrimitives): Order {
    return new Order({
      id: props.id,
      orderNumber: OrderNumber.restore(props.orderNumber),
      customerId: props.customerId,
      status: props.status,
      items: props.items.map((item) => OrderItem.restore(item)),
      deliveryAddress: OrderDeliveryAddress.restore(props.deliveryAddress),
      createdAt: new Date(props.createdAt),
      updatedAt: new Date(props.updatedAt),
    });
  }

  /** Indica se a transição consome estoque definitivamente (fulfill). */
  static consumesStock(from: OrderStatus, to: OrderStatus): boolean {
    return from === 'PROCESSING' && to === 'SHIPPED';
  }

  /** Indica se a transição libera reservas de estoque (release). */
  static releasesStock(from: OrderStatus, to: OrderStatus): boolean {
    return to === 'CANCELLED';
  }

  get id(): string {
    return this._props.id;
  }

  get orderNumber(): OrderNumber {
    return this._props.orderNumber;
  }

  get customerId(): string {
    return this._props.customerId;
  }

  get status(): OrderStatus {
    return this._props.status;
  }

  get items(): readonly OrderItem[] {
    return this._props.items;
  }

  get deliveryAddress(): OrderDeliveryAddress {
    return this._props.deliveryAddress;
  }

  get total(): Money {
    return this._props.items.reduce(
      (acc, item) => acc.add(item.subtotal),
      Money.zero(),
    );
  }

  get createdAt(): Date {
    return this._props.createdAt;
  }

  get updatedAt(): Date {
    return this._props.updatedAt;
  }

  changeStatus(next: OrderStatus): void {
    const allowed = STATUS_TRANSITIONS[this._props.status];
    if (!allowed.includes(next)) {
      throw new InvalidStatusTransitionError(this._props.status, next);
    }
    this._props.status = next;
    this._props.updatedAt = new Date();
  }

  cancel(): void {
    this.changeStatus('CANCELLED');
  }

  toJSON(): OrderPrimitives {
    return {
      id: this._props.id,
      orderNumber: this._props.orderNumber.value,
      customerId: this._props.customerId,
      status: this._props.status,
      items: this._props.items.map((item) => item.toJSON()),
      deliveryAddress: this._props.deliveryAddress.toJSON(),
      createdAt: this._props.createdAt,
      updatedAt: this._props.updatedAt,
    };
  }
}
