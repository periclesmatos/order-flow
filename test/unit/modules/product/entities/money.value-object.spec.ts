import { Money } from '@src/modules/product/domain/entities/money.value-object';
import {
  MoneyNegativeCentsError,
  MoneyNegativeFactorError,
  MoneyNonIntegerCentsError,
  MoneySubtractWouldGoNegativeError,
} from '@src/modules/product/domain/errors/money.errors';

describe('Money', () => {
  describe('fromCents', () => {
    it('creates zero', () => {
      expect(Money.fromCents(0).cents).toBe(0);
    });

    it('rejects non-integer cents', () => {
      expect(() => Money.fromCents(10.5)).toThrow(MoneyNonIntegerCentsError);
    });

    it('rejects negative cents', () => {
      expect(() => Money.fromCents(-1)).toThrow(MoneyNegativeCentsError);
    });
  });

  describe('fromFloat', () => {
    it('rounds to nearest cent', () => {
      expect(Money.fromFloat(10.5).cents).toBe(1050);
      expect(Money.fromFloat(0.01).cents).toBe(1);
      expect(Money.fromFloat(19.999).cents).toBe(2000);
    });
  });

  describe('subtract', () => {
    it('returns difference when not negative', () => {
      const a = Money.fromCents(100);
      const b = Money.fromCents(30);
      expect(a.subtract(b).cents).toBe(70);
    });

    it('throws when result would be negative', () => {
      const a = Money.fromCents(10);
      const b = Money.fromCents(20);
      expect(() => a.subtract(b)).toThrow(MoneySubtractWouldGoNegativeError);
    });
  });

  describe('multiply', () => {
    it('throws when factor is negative', () => {
      expect(() => Money.fromCents(100).multiply(-1)).toThrow(
        MoneyNegativeFactorError,
      );
    });

    it('rounds product to integer cents', () => {
      expect(Money.fromCents(100).multiply(0.333).cents).toBe(33);
    });
  });

  describe('equals / comparison', () => {
    it('compares equality', () => {
      expect(Money.fromCents(50).equals(Money.fromFloat(0.5))).toBe(true);
    });

    it('compares order', () => {
      expect(Money.fromCents(2).isGreaterThan(Money.fromCents(1))).toBe(true);
      expect(Money.fromCents(1).isLessThan(Money.fromCents(2))).toBe(true);
    });
  });
});
