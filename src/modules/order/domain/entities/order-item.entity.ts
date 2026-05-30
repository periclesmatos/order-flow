import { Money } from '../../../product/domain/entities/money.value-object';
import { OrderItemInvalidQuantityError } from '../errors/order.errors';

export interface OrderItemProps {
  id: string;
  productId: string;
  productName: string;
  price: Money;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderItemPrimitives = Omit<OrderItemProps, 'price'> & {
  price: number;
};

export type CreateOrderItemProps = {
  productId: string;
  productName: string;
  price: Money;
  quantity: number;
};

export class OrderItem {
  private readonly _props: OrderItemProps;

  private constructor(props: OrderItemProps) {
    this._props = props;
  }

  static create(props: CreateOrderItemProps): OrderItem {
    if (!Number.isInteger(props.quantity) || props.quantity <= 0) {
      throw new OrderItemInvalidQuantityError();
    }
    return new OrderItem({
      ...props,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(props: OrderItemPrimitives): OrderItem {
    return new OrderItem({
      ...props,
      price: Money.fromCents(props.price),
      createdAt: new Date(props.createdAt),
      updatedAt: new Date(props.updatedAt),
    });
  }

  get id(): string {
    return this._props.id;
  }

  get productId(): string {
    return this._props.productId;
  }

  get productName(): string {
    return this._props.productName;
  }

  get price(): Money {
    return this._props.price;
  }

  get quantity(): number {
    return this._props.quantity;
  }

  get subtotal(): Money {
    return this._props.price.multiply(this._props.quantity);
  }

  get createdAt(): Date {
    return this._props.createdAt;
  }

  get updatedAt(): Date {
    return this._props.updatedAt;
  }

  toJSON(): OrderItemPrimitives {
    return {
      ...this._props,
      price: this._props.price.cents,
    };
  }
}
