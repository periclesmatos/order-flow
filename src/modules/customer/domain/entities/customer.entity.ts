import { Address } from './address.entity';
import { Phone } from './phone.value-object';
import { Email } from './email.value-object';
import type { AddressProps, CreateAddressProps } from './address.entity';
import { CustomerAddressesDefaultCountError } from '../errors/address.errors';

export interface CustomerProps {
  id: string;
  name: string;
  email: Email;
  phone: Phone;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  addresses: Address[];
}

export type CustomerPrimitives = Omit<
  CustomerProps,
  'email' | 'phone' | 'addresses'
> & {
  email: string;
  phone: string;
  addresses?: AddressProps[];
};

export type CreateCustomerProps = {
  name: string;
  email: string;
  phone: string;
  addresses?: CreateAddressProps[];
};

function normalizeCreateAddresses(
  customerId: string,
  items: CreateAddressProps[] | undefined,
): Address[] {
  if (!items || items.length === 0) {
    return [];
  }

  if (items.length === 1) {
    const only = items[0];
    return [
      Address.create(customerId, {
        ...only,
        isDefault: only.isDefault ?? true,
      }),
    ];
  }

  const defaultFlags = items.map((a) => a.isDefault === true);
  const defaultCount = defaultFlags.filter(Boolean).length;
  if (defaultCount !== 1) {
    throw new CustomerAddressesDefaultCountError();
  }

  return items.map((item) =>
    Address.create(customerId, {
      ...item,
      isDefault: item.isDefault === true,
    }),
  );
}

export class Customer {
  private readonly _props: CustomerProps;

  private constructor(props: CustomerProps) {
    this._props = props;
  }

  static create(props: CreateCustomerProps): Customer {
    const id = crypto.randomUUID();
    const addresses = normalizeCreateAddresses(id, props.addresses);
    return new Customer({
      id,
      name: props.name,
      email: Email.from(props.email),
      phone: Phone.from(props.phone),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      addresses,
    });
  }

  static restore(props: CustomerPrimitives): Customer {
    return new Customer({
      id: props.id,
      name: props.name,
      email: Email.from(props.email),
      phone: Phone.fromE164(props.phone),
      isActive: props.isActive,
      createdAt: new Date(props.createdAt),
      updatedAt: new Date(props.updatedAt),
      addresses: props.addresses?.map((a) => Address.restore(a)) ?? [],
    });
  }

  get id(): string {
    return this._props.id;
  }

  get name(): string {
    return this._props.name;
  }

  get email(): Email {
    return this._props.email;
  }

  get phone(): Phone {
    return this._props.phone;
  }

  get addresses(): readonly Address[] {
    return this._props.addresses;
  }

  get defaultAddress(): Address | undefined {
    return this._props.addresses.find((a) => a.isDefault);
  }

  get createdAt(): Date {
    return this._props.createdAt;
  }

  get updatedAt(): Date {
    return this._props.updatedAt;
  }

  get isActive(): boolean {
    return this._props.isActive;
  }

  set name(value: string) {
    this._props.name = value;
    this._props.updatedAt = new Date();
  }

  set email(value: string) {
    this._props.email = Email.from(value);
    this._props.updatedAt = new Date();
  }

  set phone(value: string) {
    this._props.phone = Phone.from(value);
    this._props.updatedAt = new Date();
  }

  replaceAddresses(addresses: Address[]): void {
    this._props.addresses = [...addresses];
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

  toJSON(): CustomerPrimitives {
    return {
      id: this._props.id,
      name: this._props.name,
      email: this._props.email.value,
      phone: this._props.phone.e164,
      isActive: this._props.isActive,
      createdAt: this._props.createdAt,
      updatedAt: this._props.updatedAt,
      addresses: this._props.addresses.map((a) => a.toJSON()),
    };
  }
}
