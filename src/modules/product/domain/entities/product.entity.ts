import {
  InsufficientStockError,
  ProductEmptyDescriptionError,
  ProductEmptyNameError,
  ProductNegativeAmountError,
  ProductNegativePriceError,
} from '../errors/product.errors';
import { Money } from './money.value-object';

export interface ProductProps {
  id: string;
  name: string;
  description: string;
  price: Money;
  stockOnHand: number;
  reservedQuantity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductPrimitives = Omit<ProductProps, 'price'> & {
  price: number;
};

export type CreateProductProps = {
  name: string;
  description: string;
  price: Money;
  stockOnHand: number;
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
      reservedQuantity: 0,
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

  get description(): string {
    return this._props.description;
  }

  get price(): Money {
    return this._props.price;
  }

  get stockOnHand(): number {
    return this._props.stockOnHand;
  }

  get reservedQuantity(): number {
    return this._props.reservedQuantity;
  }

  get availableQuantity(): number {
    return this._props.stockOnHand - this._props.reservedQuantity;
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
    if (!value?.trim()) throw new ProductEmptyNameError();
    this._props.name = value.trim();
    this._props.updatedAt = new Date();
  }

  set description(value: string) {
    if (!value?.trim()) throw new ProductEmptyDescriptionError();
    this._props.description = value.trim();
    this._props.updatedAt = new Date();
  }

  set price(value: Money) {
    if (value.cents < 0) throw new ProductNegativePriceError();
    this._props.price = value;
    this._props.updatedAt = new Date();
  }

  set stockOnHand(value: number) {
    if (value < 0) throw new ProductNegativeAmountError();
    this._props.stockOnHand = value;
    this._props.updatedAt = new Date();
  }

  reserve(quantity: number): void {
    if (this.availableQuantity < quantity) {
      throw new InsufficientStockError(quantity, this.availableQuantity);
    }
    this._props.reservedQuantity += quantity;
    this._props.updatedAt = new Date();
  }

  release(quantity: number): void {
    const next = this._props.reservedQuantity - quantity;
    if (next < 0) throw new ProductNegativeAmountError();
    this._props.reservedQuantity = next;
    this._props.updatedAt = new Date();
  }

  fulfill(quantity: number): void {
    if (this._props.reservedQuantity < quantity)
      throw new ProductNegativeAmountError();
    this._props.stockOnHand -= quantity;
    this._props.reservedQuantity -= quantity;
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
