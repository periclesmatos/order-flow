import { Email } from '@src/modules/customer/domain/entities/email.value-object';
import { EmailEmptyError, EmailInvalidFormatError } from '@src/modules/customer/domain/errors/email.errors';

describe('Email value object', () => {
  describe('from() - valid', () => {
    it('parses a simple valid email', () => {
      const email = Email.from('user@example.com');

      expect(email.value).toBe('user@example.com');
      expect(email.local).toBe('user');
      expect(email.domain).toBe('example.com');
    });

    it('accepts subdomains and TLDs with multiple parts', () => {
      const email = Email.from('john.doe@mail.example.co.uk');

      expect(email.value).toBe('john.doe@mail.example.co.uk');
      expect(email.local).toBe('john.doe');
      expect(email.domain).toBe('mail.example.co.uk');
    });

    it('accepts plus-addressing (gmail-style)', () => {
      const email = Email.from('user+tag@gmail.com');

      expect(email.value).toBe('user+tag@gmail.com');
      expect(email.local).toBe('user+tag');
    });

    it('accepts numbers and hyphens in domain', () => {
      const email = Email.from('contact@my-shop-123.com');

      expect(email.domain).toBe('my-shop-123.com');
    });
  });

  describe('from() - normalization', () => {
    it('trims surrounding whitespace', () => {
      const email = Email.from('  user@example.com  ');

      expect(email.value).toBe('user@example.com');
    });

    it('lowercases the entire address', () => {
      const email = Email.from('USER@Example.COM');

      expect(email.value).toBe('user@example.com');
      expect(email.local).toBe('user');
      expect(email.domain).toBe('example.com');
    });

    it('combines trim and lowercase', () => {
      const email = Email.from('  John.Doe@Example.com  ');

      expect(email.value).toBe('john.doe@example.com');
    });
  });

  describe('from() - invalid', () => {
    it('throws EmailEmptyError for empty string', () => {
      expect(() => Email.from('')).toThrow(EmailEmptyError);
    });

    it('throws EmailEmptyError for whitespace-only string', () => {
      expect(() => Email.from('   ')).toThrow(EmailEmptyError);
    });

    it('throws EmailEmptyError for null', () => {
      expect(() => Email.from(null as unknown as string)).toThrow(EmailEmptyError);
    });

    it('throws EmailEmptyError for undefined', () => {
      expect(() => Email.from(undefined as unknown as string)).toThrow(EmailEmptyError);
    });

    it('throws EmailInvalidFormatError when missing @', () => {
      expect(() => Email.from('userexample.com')).toThrow(EmailInvalidFormatError);
    });

    it('throws EmailInvalidFormatError when missing local part', () => {
      expect(() => Email.from('@example.com')).toThrow(EmailInvalidFormatError);
    });

    it('throws EmailInvalidFormatError when missing domain', () => {
      expect(() => Email.from('user@')).toThrow(EmailInvalidFormatError);
    });

    it('throws EmailInvalidFormatError when missing TLD', () => {
      expect(() => Email.from('user@example')).toThrow(EmailInvalidFormatError);
    });

    it('throws EmailInvalidFormatError for spaces inside the address', () => {
      expect(() => Email.from('us er@example.com')).toThrow(EmailInvalidFormatError);
    });

    it('throws EmailInvalidFormatError for two @ characters', () => {
      expect(() => Email.from('user@@example.com')).toThrow(EmailInvalidFormatError);
    });
  });

  describe('equals()', () => {
    it('returns true for two emails with the same canonical value', () => {
      const a = Email.from('user@example.com');
      const b = Email.from('user@example.com');

      expect(a.equals(b)).toBe(true);
    });

    it('returns true regardless of case differences in input', () => {
      const a = Email.from('User@Example.com');
      const b = Email.from('USER@EXAMPLE.COM');

      expect(a.equals(b)).toBe(true);
    });

    it('returns true regardless of surrounding whitespace', () => {
      const a = Email.from('  user@example.com');
      const b = Email.from('user@example.com  ');

      expect(a.equals(b)).toBe(true);
    });

    it('returns false for different emails', () => {
      const a = Email.from('user@example.com');
      const b = Email.from('other@example.com');

      expect(a.equals(b)).toBe(false);
    });
  });

  describe('toString()', () => {
    it('returns the canonical value', () => {
      const email = Email.from('User@Example.COM');

      expect(email.toString()).toBe('user@example.com');
    });
  });
});
