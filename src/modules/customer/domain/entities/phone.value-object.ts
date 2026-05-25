import { parsePhoneNumberWithError, ParseError } from 'libphonenumber-js';
import { PhoneEmptyError, PhoneInvalidFormatError, PhoneInvalidNumberError } from '../errors/phone.errors.js';
import type { CountryCode, PhoneNumber } from 'libphonenumber-js';

const DEFAULT_COUNTRY: CountryCode = 'BR';

export class Phone {
  private readonly _e164: string;
  private readonly _country: CountryCode;
  private readonly _countryCallingCode: string;
  private readonly _nationalNumber: string;

  private constructor(parsed: PhoneNumber) {
    this._e164 = parsed.number;
    this._country = parsed.country as CountryCode;
    this._countryCallingCode = String(parsed.countryCallingCode);
    this._nationalNumber = String(parsed.nationalNumber);
  }

  static from(input: string, defaultCountry: CountryCode = DEFAULT_COUNTRY): Phone {
    if (!input || !input.trim()) {
      throw new PhoneEmptyError();
    }

    let parsed: PhoneNumber;
    try {
      parsed = parsePhoneNumberWithError(input.trim(), defaultCountry);
    } catch (err) {
      if (err instanceof ParseError) {
        throw new PhoneInvalidFormatError();
      }
      throw err;
    }

    if (!parsed.isValid()) {
      throw new PhoneInvalidNumberError();
    }

    Phone.assertBrazilianMobileNinthDigit(parsed);

    return new Phone(parsed);
  }

  /**
   * Brazilian mobile numbers (introduced by Anatel in 2014) MUST have a `9`
   * as the first digit after the DDD. A national number of length 11 in BR
   * indicates a mobile, so we reject any 11-digit BR number whose third digit
   * (first after the DDD) is not `9`.
   */
  private static assertBrazilianMobileNinthDigit(parsed: PhoneNumber): void {
    if (parsed.country !== 'BR') return;
    const national = String(parsed.nationalNumber);
    if (national.length === 11 && national[2] !== '9') {
      throw new PhoneInvalidNumberError();
    }
  }

  static fromE164(e164: string): Phone {
    if (!e164 || !e164.trim()) {
      throw new PhoneEmptyError();
    }
    if (!e164.startsWith('+')) {
      throw new PhoneInvalidFormatError();
    }
    return Phone.from(e164);
  }

  get e164(): string {
    return this._e164;
  }

  get country(): CountryCode {
    return this._country;
  }

  get countryCallingCode(): string {
    return this._countryCallingCode;
  }

  get nationalNumber(): string {
    return this._nationalNumber;
  }

  /**
   * Area code / DDD. Currently only computed for Brazil (first 2 digits of
   * the national number). Returns `undefined` for other countries since
   * libphonenumber-js does not expose a uniform area-code accessor.
   */
  get areaCode(): string | undefined {
    if (this._country === 'BR' && this._nationalNumber.length >= 2) {
      return this._nationalNumber.slice(0, 2);
    }
    return undefined;
  }

  get formattedInternational(): string {
    return parsePhoneNumberWithError(this._e164).formatInternational();
  }

  get formattedNational(): string {
    return parsePhoneNumberWithError(this._e164).formatNational();
  }

  equals(other: Phone): boolean {
    return this._e164 === other._e164;
  }

  toString(): string {
    return this._e164;
  }
}
