import { Category } from '@src/modules/product/domain/entities/category.entity';
import type { CreateCategoryProps } from '@src/modules/product/domain/entities/category.entity';

export const DEFAULT_CATEGORY_NAME = 'Eletrônicos';

export function categoryCreateProps(
  overrides: Partial<CreateCategoryProps> = {},
): CreateCategoryProps {
  return {
    name: DEFAULT_CATEGORY_NAME,
    ...overrides,
  };
}

export function createTestCategory(
  overrides: Partial<CreateCategoryProps> = {},
): Category {
  return Category.create(categoryCreateProps(overrides));
}
