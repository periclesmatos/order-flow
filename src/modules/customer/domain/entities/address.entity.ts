export interface AddressProps {
  id: string;
  customerId: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateAddressProps = {
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
};

export class Address {
  private readonly _props: AddressProps;

  private constructor(props: AddressProps) {
    this._props = props;
  }

  static create(customerId: string, props: CreateAddressProps): Address {
    return new Address({
      ...props,
      customerId,
      id: crypto.randomUUID(),
      isDefault: props.isDefault ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(props: AddressProps): Address {
    return new Address({
      ...props,
      createdAt: new Date(props.createdAt),
      updatedAt: new Date(props.updatedAt),
    });
  }

  get id(): string {
    return this._props.id;
  }

  get customerId(): string {
    return this._props.customerId;
  }

  get street(): string {
    return this._props.street;
  }

  get number(): string {
    return this._props.number;
  }

  get complement(): string {
    return this._props.complement;
  }

  get neighborhood(): string {
    return this._props.neighborhood;
  }

  get city(): string {
    return this._props.city;
  }

  get state(): string {
    return this._props.state;
  }

  get postalCode(): string {
    return this._props.postalCode;
  }

  get country(): string {
    return this._props.country;
  }

  get isDefault(): boolean {
    return this._props.isDefault;
  }

  get createdAt(): Date {
    return this._props.createdAt;
  }

  get updatedAt(): Date {
    return this._props.updatedAt;
  }

  set street(value: string) {
    this._props.street = value;
    this._props.updatedAt = new Date();
  }

  set number(value: string) {
    this._props.number = value;
    this._props.updatedAt = new Date();
  }

  set complement(value: string) {
    this._props.complement = value;
    this._props.updatedAt = new Date();
  }

  set neighborhood(value: string) {
    this._props.neighborhood = value;
    this._props.updatedAt = new Date();
  }

  set city(value: string) {
    this._props.city = value;
    this._props.updatedAt = new Date();
  }

  set state(value: string) {
    this._props.state = value;
    this._props.updatedAt = new Date();
  }

  set postalCode(value: string) {
    this._props.postalCode = value;
    this._props.updatedAt = new Date();
  }

  set country(value: string) {
    this._props.country = value;
    this._props.updatedAt = new Date();
  }

  set isDefault(value: boolean) {
    this._props.isDefault = value;
    this._props.updatedAt = new Date();
  }

  toJSON(): AddressProps {
    return {
      ...this._props,
    };
  }
}
