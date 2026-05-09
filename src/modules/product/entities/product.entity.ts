import { Money } from './money.value-object.js';

export interface ProductProps {
  id: string;
  name: string;
  price: Money;
  amount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductPrimitives = Omit<ProductProps, 'price'> & {
  price: number;
};

export type CreateProductProps = {
  name: string;
  price: Money;
  amount: number;
};

export class Product {
  private readonly _props: ProductProps;

  private constructor(props: ProductProps) {
    this._props = props;
  }

  static create(props: CreateProductProps): Product {
    return new Product({
      ...props,
      id: crypto.randomUUID(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(props: ProductPrimitives): Product {
    return new Product({
      ...props,
      price: Money.fromCents(props.price),
    });
  }

  get id(): string {
    return this._props.id;
  }

  get name(): string {
    return this._props.name;
  }

  get price(): Money {
    return this._props.price;
  }

  get amount(): number {
    return this._props.amount;
  }

  get isActive(): boolean {
    return this._props.isActive;
  }

  get createdAt(): Date {
    return this._props.createdAt;
  }

  get updatedAt(): Date {
    return this._props.updatedAt;
  }

  set name(value: string) {
    if (!value?.trim()) throw new Error('Product name cannot be empty.');
    this._props.name = value.trim();
    this._props.updatedAt = new Date();
  }

  set price(value: Money) {
    if (value.cents < 0) throw new Error('Product price cannot be negative.');
    this._props.price = value;
    this._props.updatedAt = new Date();
  }

  set amount(value: number) {
    if (value < 0) throw new Error('Product amount cannot be negative.');
    this._props.amount = value;
    this._props.updatedAt = new Date();
  }

  activate(): void {
    this._props.isActive = true;
    this._props.updatedAt = new Date();
  }

  deactivate(): void {
    this._props.isActive = false;
    this._props.updatedAt = new Date();
  }

  toJSON(): ProductPrimitives {
    return {
      ...this._props,
      price: this._props.price.cents,
    };
  }
}
