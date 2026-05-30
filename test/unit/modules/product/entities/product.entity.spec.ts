import { Product } from '@src/modules/product/domain/entities/product.entity';
import { Money } from '@src/modules/product/domain/entities/money.value-object';
import {
  InsufficientStockError,
  ProductEmptyDescriptionError,
  ProductEmptyNameError,
  ProductNegativeAmountError,
  ProductNegativePriceError,
} from '@src/modules/product/domain/errors/product.errors';
import {
  createTestProduct,
  DEFAULT_PRODUCT_DESCRIPTION,
  productCreateProps,
} from '../product-test.helpers';

describe('Product', () => {
  const baseCreated = new Date('2024-06-01T10:00:00.000Z');
  const baseUpdated = new Date('2024-06-02T10:00:00.000Z');

  it('create assigns id and defaults', () => {
    const p = Product.create(
      productCreateProps({
        name: 'Item',
        description: 'Item description',
        price: Money.fromCents(100),
        stockOnHand: 5,
      }),
    );

    expect(p.id).toEqual(expect.any(String));
    expect(p.name).toBe('Item');
    expect(p.description).toBe('Item description');
    expect(p.price.cents).toBe(100);
    expect(p.stockOnHand).toBe(5);
    expect(p.reservedQuantity).toBe(0);
    expect(p.availableQuantity).toBe(5);
    expect(p.isActive).toBe(true);
  });

  it('restore maps primitives', () => {
    const p = Product.restore({
      id: 'id-1',
      name: 'Restored',
      description: 'Restored description',
      price: 250,
      stockOnHand: 10,
      reservedQuantity: 3,
      isActive: false,
      createdAt: baseCreated,
      updatedAt: baseUpdated,
    });

    expect(p.id).toBe('id-1');
    expect(p.description).toBe('Restored description');
    expect(p.price.cents).toBe(250);
    expect(p.stockOnHand).toBe(10);
    expect(p.reservedQuantity).toBe(3);
    expect(p.availableQuantity).toBe(7);
    expect(p.isActive).toBe(false);
  });

  it('availableQuantity is always computed from stockOnHand - reservedQuantity', () => {
    const p = createTestProduct({ stockOnHand: 20 });
    expect(p.availableQuantity).toBe(20);

    p.stockOnHand = 30;
    expect(p.availableQuantity).toBe(30);

    p.reserve(10);
    expect(p.availableQuantity).toBe(20);
  });

  it('set name throws when empty after trim', () => {
    const p = createTestProduct();

    expect(() => {
      p.name = '   ';
    }).toThrow(ProductEmptyNameError);
  });

  it('set description throws when empty after trim', () => {
    const p = createTestProduct();

    expect(() => {
      p.description = '   ';
    }).toThrow(ProductEmptyDescriptionError);
  });

  it('set price throws when cents are negative', () => {
    const p = createTestProduct();
    const invalidMoney = { cents: -1 } as Money;

    expect(() => {
      p.price = invalidMoney;
    }).toThrow(ProductNegativePriceError);
  });

  it('set stockOnHand throws when negative', () => {
    const p = createTestProduct();

    expect(() => {
      p.stockOnHand = -1;
    }).toThrow(ProductNegativeAmountError);
  });

  describe('reserve', () => {
    it('decreases availableQuantity', () => {
      const p = createTestProduct({ stockOnHand: 10 });
      p.reserve(3);
      expect(p.reservedQuantity).toBe(3);
      expect(p.availableQuantity).toBe(7);
      expect(p.stockOnHand).toBe(10);
    });

    it('throws InsufficientStockError when quantity exceeds available', () => {
      const p = createTestProduct({ stockOnHand: 5 });
      expect(() => p.reserve(6)).toThrow(InsufficientStockError);
    });

    it('allows reserving the full available quantity', () => {
      const p = createTestProduct({ stockOnHand: 5 });
      p.reserve(5);
      expect(p.availableQuantity).toBe(0);
    });
  });

  describe('release', () => {
    it('increases availableQuantity', () => {
      const p = createTestProduct({ stockOnHand: 10 });
      p.reserve(4);
      p.release(2);
      expect(p.reservedQuantity).toBe(2);
      expect(p.availableQuantity).toBe(8);
    });

    it('throws when releasing more than reserved', () => {
      const p = createTestProduct({ stockOnHand: 10 });
      p.reserve(2);
      expect(() => p.release(3)).toThrow(ProductNegativeAmountError);
    });
  });

  describe('fulfill', () => {
    it('decreases both stockOnHand and reservedQuantity', () => {
      const p = createTestProduct({ stockOnHand: 10 });
      p.reserve(4);
      p.fulfill(4);
      expect(p.stockOnHand).toBe(6);
      expect(p.reservedQuantity).toBe(0);
      expect(p.availableQuantity).toBe(6);
    });

    it('throws when fulfilling more than reserved', () => {
      const p = createTestProduct({ stockOnHand: 10 });
      p.reserve(2);
      expect(() => p.fulfill(3)).toThrow(ProductNegativeAmountError);
    });
  });

  it('activate and deactivate toggle isActive', () => {
    const p = createTestProduct();

    p.deactivate();
    expect(p.isActive).toBe(false);

    p.activate();
    expect(p.isActive).toBe(true);
  });

  describe('category', () => {
    const snapshot = { id: 'cat-1', name: 'Eletrônicos', isActive: true };

    it('restore keeps the category snapshot and toJSON round-trips it', () => {
      const p = Product.restore({
        id: 'id-1',
        name: 'Restored',
        description: 'Restored description',
        price: 250,
        stockOnHand: 10,
        reservedQuantity: 3,
        isActive: true,
        categoryId: 'cat-1',
        category: snapshot,
        createdAt: baseCreated,
        updatedAt: baseUpdated,
      });

      expect(p.categoryId).toBe('cat-1');
      expect(p.category).toEqual(snapshot);
      expect(p.toJSON().category).toEqual(snapshot);
    });

    it('assignCategory changes categoryId and bumps updatedAt', () => {
      const p = createTestProduct();
      const before = p.updatedAt.getTime();

      p.assignCategory('cat-2');

      expect(p.categoryId).toBe('cat-2');
      expect(p.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
    });

    it('create without categoryId leaves category undefined', () => {
      const p = createTestProduct();
      expect(p.categoryId).toBeUndefined();
      expect(p.category).toBeUndefined();
    });
  });

  it('toJSON exposes price as cents and description', () => {
    const p = Product.create({
      name: 'A',
      description: DEFAULT_PRODUCT_DESCRIPTION,
      price: Money.fromFloat(12.34),
      stockOnHand: 3,
    });

    const json = p.toJSON();
    expect(json.price).toBe(1234);
    expect(json.name).toBe('A');
    expect(json.description).toBe(DEFAULT_PRODUCT_DESCRIPTION);
    expect(json.stockOnHand).toBe(3);
    expect(json.reservedQuantity).toBe(0);
  });
});
