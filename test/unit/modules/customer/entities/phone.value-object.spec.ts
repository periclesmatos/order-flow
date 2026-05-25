import { Phone } from '@src/modules/customer/domain/entities/phone.value-object';
import { PhoneEmptyError, PhoneInvalidFormatError, PhoneInvalidNumberError } from '@src/modules/customer/domain/errors/phone.errors';

describe('Phone value object', () => {
  describe('from() - BR', () => {
    it('parses a valid Brazilian mobile in E.164 format', () => {
      const phone = Phone.from('+5511987654321');

      expect(phone.e164).toBe('+5511987654321');
      expect(phone.country).toBe('BR');
      expect(phone.countryCallingCode).toBe('55');
      expect(phone.nationalNumber).toBe('11987654321');
      expect(phone.areaCode).toBe('11');
    });

    it('parses a valid Brazilian mobile typed in national format with default country BR', () => {
      const phone = Phone.from('11987654321');

      expect(phone.e164).toBe('+5511987654321');
      expect(phone.country).toBe('BR');
      expect(phone.areaCode).toBe('11');
    });

    it('parses a valid Brazilian landline', () => {
      const phone = Phone.from('+551130001000');

      expect(phone.e164).toBe('+551130001000');
      expect(phone.country).toBe('BR');
      expect(phone.areaCode).toBe('11');
    });

    it('normalizes a Brazilian mobile with separators and spaces', () => {
      const phone = Phone.from('+55 (11) 98765-4321');

      expect(phone.e164).toBe('+5511987654321');
    });

    it('rejects a Brazilian mobile missing the ninth digit', () => {
      expect(() => Phone.from('+5511887654321')).toThrow(PhoneInvalidNumberError);
    });
  });

  describe('from() - international', () => {
    it('parses a valid US number', () => {
      const phone = Phone.from('+14155552671');

      expect(phone.e164).toBe('+14155552671');
      expect(phone.country).toBe('US');
      expect(phone.countryCallingCode).toBe('1');
      expect(phone.areaCode).toBeUndefined();
    });

    it('parses a valid Portuguese mobile number', () => {
      const phone = Phone.from('+351912345678');

      expect(phone.e164).toBe('+351912345678');
      expect(phone.country).toBe('PT');
      expect(phone.countryCallingCode).toBe('351');
    });

    it('rejects an invalid country calling code', () => {
      expect(() => Phone.from('+999123456789')).toThrow(PhoneInvalidFormatError);
    });
  });

  describe('from() - edge cases', () => {
    it('throws PhoneEmptyError for empty string', () => {
      expect(() => Phone.from('')).toThrow(PhoneEmptyError);
    });

    it('throws PhoneEmptyError for whitespace-only string', () => {
      expect(() => Phone.from('   ')).toThrow(PhoneEmptyError);
    });

    it('throws PhoneInvalidFormatError for non-numeric garbage', () => {
      expect(() => Phone.from('abc')).toThrow(PhoneInvalidFormatError);
    });

    it('throws PhoneInvalidNumberError for too-short national number', () => {
      expect(() => Phone.from('+551198')).toThrow(PhoneInvalidNumberError);
    });
  });

  describe('fromE164()', () => {
    it('accepts a properly formatted E.164 string', () => {
      const phone = Phone.fromE164('+5511987654321');

      expect(phone.e164).toBe('+5511987654321');
      expect(phone.country).toBe('BR');
    });

    it('rejects an E.164 string without leading "+"', () => {
      expect(() => Phone.fromE164('5511987654321')).toThrow(PhoneInvalidFormatError);
    });

    it('rejects an empty string', () => {
      expect(() => Phone.fromE164('')).toThrow(PhoneEmptyError);
    });
  });

  describe('formatting', () => {
    it('formats a Brazilian mobile internationally', () => {
      const phone = Phone.from('+5511987654321');

      expect(phone.formattedInternational).toMatch(/^\+55\s11\s98765[-\s]4321$/);
    });

    it('formats a Brazilian mobile in national format', () => {
      const phone = Phone.from('+5511987654321');

      expect(phone.formattedNational).toMatch(/^\(11\)\s98765[-\s]4321$/);
    });

    it('toString() returns the E.164 representation', () => {
      const phone = Phone.from('+5511987654321');

      expect(phone.toString()).toBe('+5511987654321');
    });
  });

  describe('equals()', () => {
    it('returns true for two phones with the same E.164', () => {
      const a = Phone.from('+5511987654321');
      const b = Phone.from('11987654321');

      expect(a.equals(b)).toBe(true);
    });

    it('returns true even when one input has separators', () => {
      const a = Phone.from('+5511987654321');
      const b = Phone.from('+55 (11) 98765-4321');

      expect(a.equals(b)).toBe(true);
    });

    it('returns false for different numbers', () => {
      const a = Phone.from('+5511987654321');
      const b = Phone.from('+5511987654322');

      expect(a.equals(b)).toBe(false);
    });

    it('returns false for different countries', () => {
      const a = Phone.from('+5511987654321');
      const b = Phone.from('+14155552671');

      expect(a.equals(b)).toBe(false);
    });
  });
});
