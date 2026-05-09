export class Money {
  private readonly _cents: number;

  private constructor(cents: number) {
    if (!Number.isInteger(cents)) {
      throw new Error('Money amount must be an integer number of cents.');
    }
    if (cents < 0) {
      throw new Error('Money amount cannot be negative.');
    }
    this._cents = cents;
  }

  static fromCents(cents: number): Money {
    return new Money(cents);
  }

  static fromFloat(value: number): Money {
    const cents = Math.round(value * 100);
    return new Money(cents);
  }

  static zero(): Money {
    return new Money(0);
  }

  get cents(): number {
    return this._cents;
  }

  toFloat(): number {
    return this._cents / 100;
  }

  toString(): string {
    return this.toFloat().toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  add(other: Money): Money {
    return new Money(this._cents + other._cents);
  }

  subtract(other: Money): Money {
    const result = this._cents - other._cents;
    if (result < 0) {
      throw new Error('Money subtraction cannot result in a negative amount.');
    }
    return new Money(result);
  }

  multiply(factor: number): Money {
    if (factor < 0) {
      throw new Error('Money multiplication factor cannot be negative.');
    }
    return new Money(Math.round(this._cents * factor));
  }

  equals(other: Money): boolean {
    return this._cents === other._cents;
  }

  isGreaterThan(other: Money): boolean {
    return this._cents > other._cents;
  }

  isLessThan(other: Money): boolean {
    return this._cents < other._cents;
  }
}
