import { Product } from '@src/modules/product/domain/entities/product.entity';
import { Money } from '@src/modules/product/domain/entities/money.value-object';
import type { CreateProductProps } from '@src/modules/product/domain/entities/product.entity';

export const DEFAULT_PRODUCT_DESCRIPTION = 'Descrição de teste';

export function productCreateProps(
  overrides: Partial<CreateProductProps> = {},
): CreateProductProps {
  return {
    name: 'Item',
    description: DEFAULT_PRODUCT_DESCRIPTION,
    price: Money.zero(),
    stockOnHand: 0,
    ...overrides,
  };
}

export function createTestProduct(overrides: Partial<CreateProductProps> = {}): Product {
  return Product.create(productCreateProps(overrides));
}
