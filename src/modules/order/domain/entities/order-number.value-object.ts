export class OrderNumber {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static generate(sequence: number): OrderNumber {
    return new OrderNumber(`ORD-${String(sequence).padStart(6, '0')}`);
  }

  static restore(value: string): OrderNumber {
    return new OrderNumber(value);
  }

  get value(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }
}
