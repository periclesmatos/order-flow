import type { Category } from '../entities/category.entity';

export const CATEGORY_REPOSITORY = 'CATEGORY_REPOSITORY';

export interface CategoryFilters {
  name?: string;
  isActive?: boolean;
  page: number;
  limit: number;
}

export interface CategoryPageResult {
  categories: Category[];
  total: number;
}

export interface ICategoryRepository {
  create(category: Category): Promise<Category>;
  findByName(name: string): Promise<Category | null>;
  findById(id: string): Promise<Category | null>;
  findAll(filters: CategoryFilters): Promise<CategoryPageResult>;
  hasLinkedProducts(id: string): Promise<boolean>;
  update(id: string, category: Category): Promise<Category>;
  delete(id: string): Promise<void>;
}
