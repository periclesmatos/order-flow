export interface OrderDeliveryAddressProps {
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export class OrderDeliveryAddress {
  private readonly _props: OrderDeliveryAddressProps;

  private constructor(props: OrderDeliveryAddressProps) {
    this._props = props;
  }

  static createFromAddress(props: OrderDeliveryAddressProps): OrderDeliveryAddress {
    return new OrderDeliveryAddress({ ...props });
  }

  static restore(props: OrderDeliveryAddressProps): OrderDeliveryAddress {
    return new OrderDeliveryAddress({ ...props });
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

  toJSON(): OrderDeliveryAddressProps {
    return { ...this._props };
  }
}
