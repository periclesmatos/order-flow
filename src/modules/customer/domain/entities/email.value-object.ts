import { z } from 'zod';
import { EmailEmptyError, EmailInvalidFormatError } from '../errors/email.errors.js';

const emailSchema = z.email();

export class Email {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static from(input: string): Email {
    if (input === null || input === undefined) {
      throw new EmailEmptyError();
    }
    const trimmed = input.trim();
    if (trimmed.length === 0) {
      throw new EmailEmptyError();
    }

    const normalized = trimmed.toLowerCase();
    const result = emailSchema.safeParse(normalized);
    if (!result.success) {
      throw new EmailInvalidFormatError();
    }

    return new Email(normalized);
  }

  get value(): string {
    return this._value;
  }

  get local(): string {
    return this._value.slice(0, this._value.lastIndexOf('@'));
  }

  get domain(): string {
    return this._value.slice(this._value.lastIndexOf('@') + 1);
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
